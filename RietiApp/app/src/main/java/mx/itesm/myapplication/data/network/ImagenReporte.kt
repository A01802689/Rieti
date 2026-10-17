package mx.itesm.myapplication.data.network

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import androidx.exifinterface.media.ExifInterface
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlin.coroutines.cancellation.CancellationException
import kotlin.math.max
import kotlin.math.min

/** Foto lista para subir: JPEG ya reducido y sin metadatos. Se compara por referencia, no por contenido. */
class FotoReporte(val bytes: ByteArray)

/**
 * Lee la imagen elegida, corrige su orientación, la reduce a [ladoMaximo] píxeles y la guarda
 * como JPEG. Al volver a codificarla se eliminan los metadatos EXIF (GPS, modelo, fecha).
 *
 * @return Los bytes del JPEG, o `null` si no se pudo leer la imagen.
 */
suspend fun procesarImagen(
    context: Context,
    uri: Uri,
    ladoMaximo: Int = 1600,
    calidad: Int = 80
): ByteArray? = withContext(Dispatchers.IO) {
    try {
        val resolver = context.contentResolver

        // 1) Dimensiones, sin cargar la imagen completa.
        val limites = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, limites) }
        if (limites.outWidth <= 0 || limites.outHeight <= 0) return@withContext null

        // 2) Decodificación reducida (potencias de 2) para no gastar memoria.
        var muestra = 1
        while (max(limites.outWidth, limites.outHeight) / (muestra * 2) >= ladoMaximo) muestra *= 2
        val original = resolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = muestra })
        } ?: return@withContext null

        // 3) Rotación según EXIF + escala final al lado máximo.
        val orientacion = resolver.openInputStream(uri)?.use {
            ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
        } ?: ExifInterface.ORIENTATION_NORMAL

        val matriz = Matrix()
        when (orientacion) {
            ExifInterface.ORIENTATION_ROTATE_90 -> matriz.postRotate(90f)
            ExifInterface.ORIENTATION_ROTATE_180 -> matriz.postRotate(180f)
            ExifInterface.ORIENTATION_ROTATE_270 -> matriz.postRotate(270f)
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matriz.postScale(-1f, 1f)
            ExifInterface.ORIENTATION_FLIP_VERTICAL -> matriz.postScale(1f, -1f)
            ExifInterface.ORIENTATION_TRANSPOSE -> { matriz.postRotate(90f); matriz.postScale(-1f, 1f) }
            ExifInterface.ORIENTATION_TRANSVERSE -> { matriz.postRotate(-90f); matriz.postScale(-1f, 1f) }
        }
        val escala = min(1f, ladoMaximo / max(original.width, original.height).toFloat())
        matriz.postScale(escala, escala)

        val final = Bitmap.createBitmap(original, 0, 0, original.width, original.height, matriz, true)

        // 4) JPEG nuevo, sin metadatos.
        ByteArrayOutputStream().use { salida ->
            final.compress(Bitmap.CompressFormat.JPEG, calidad, salida)
            salida.toByteArray()
        }
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        null
    }
}

// Cliente aparte, sin cookies de sesión ni interceptor de logs (un log de BODY imprimiría la imagen).
private val clienteSubida = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(60, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .build()

private sealed interface ResultadoSubida {
    object Ok : ResultadoSubida
    object Reintentable : ResultadoSubida   // corte de red o error 5xx
    object Rechazada : ResultadoSubida      // 4xx: firma incorrecta o URL vencida
}

private suspend fun intentarSubida(url: String, bytes: ByteArray): ResultadoSubida =
    withContext(Dispatchers.IO) {
        try {
            val peticion = Request.Builder()
                .url(url)
                .put(bytes.toRequestBody("image/jpeg".toMediaType()))
                .build()
            clienteSubida.newCall(peticion).execute().use { respuesta ->
                when {
                    respuesta.isSuccessful -> ResultadoSubida.Ok
                    respuesta.code in 400..499 -> {
                        // Solo se registra el código de error de S3 (por ejemplo SignatureDoesNotMatch), nunca la URL.
                        val codigo = Regex("<Code>(.*?)</Code>")
                            .find(respuesta.body?.string().orEmpty())?.groupValues?.get(1)
                        Log.w("Subida", "S3 rechazó la imagen: HTTP ${respuesta.code} $codigo")
                        ResultadoSubida.Rechazada
                    }
                    else -> {
                        Log.w("Subida", "S3 respondió HTTP ${respuesta.code}")
                        ResultadoSubida.Reintentable
                    }
                }
            }
        } catch (e: IOException) {
            ResultadoSubida.Reintentable
        } catch (e: IllegalArgumentException) {
            ResultadoSubida.Rechazada // URL inválida
        }
    }

/**
 * Sube [bytes] a la URL prefirmada del backend, con hasta [intentos] intentos si hay fallos de red.
 * La URL dura 5 minutos, así que los reintentos son cortos. No registres [url] en Logcat:
 * la firma funciona como una contraseña temporal.
 *
 * @return `true` si S3 aceptó la imagen.
 */
suspend fun subirImagen(url: String, bytes: ByteArray, intentos: Int = 3): Boolean {
    repeat(intentos) { n ->
        when (intentarSubida(url, bytes)) {
            ResultadoSubida.Ok -> return true
            ResultadoSubida.Rechazada -> return false
            ResultadoSubida.Reintentable -> if (n < intentos - 1) delay(1000L * (n + 1))
        }
    }
    return false
}