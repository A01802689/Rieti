package mx.itesm.myapplication.view.general

import android.graphics.BitmapFactory
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.FotoReporte
import mx.itesm.myapplication.data.network.procesarImagen
import mx.itesm.myapplication.viewModel.EnvioUiState

/**
 * Último paso del reporte: descripción, fotografía opcional y botón de envío.
 *
 * @param descripcion Texto de la descripción.
 * @param onDescripcionChange Se llama al editar la descripción.
 * @param foto Fotografía ya procesada, o `null` si no hay.
 * @param onFotoSeleccionada Se llama con la foto elegida, o con `null` al quitarla.
 * @param envio Estado del envío (carga, subida de imagen o error).
 * @param puedeEnviar Si el botón de enviar está habilitado.
 * @param onEnviar Acción del botón de enviar.
 */
@Composable
fun Enviar(
    descripcion: String,
    onDescripcionChange: (String) -> Unit,
    foto: FotoReporte?,                              // nullable
    onFotoSeleccionada: (FotoReporte?) -> Unit,      // nullable
    envio: EnvioUiState,
    puedeEnviar: Boolean,
    onEnviar: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var procesando by remember { mutableStateOf(false) }
    var errorFoto by remember { mutableStateOf<String?>(null) }
    var avisoAceptado by rememberSaveable { mutableStateOf(false) }
    var mostrarAviso by remember { mutableStateOf(false) }

    val selector = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            scope.launch {
                procesando = true
                errorFoto = null
                val bytes = procesarImagen(context, uri)
                if (bytes != null) onFotoSeleccionada(FotoReporte(bytes))
                else errorFoto = "No se pudo leer la imagen. Elige otra."
                procesando = false
            }
        }
    }

    fun abrirSelector() = selector.launch(
        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
    )

    val enviando = envio is EnvioUiState.Loading || envio is EnvioUiState.SubiendoImagen

    Column(modifier = modifier) {
        Column(
            modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = descripcion,
                onValueChange = onDescripcionChange,
                label = { Text("Describe la situación") },
                modifier = Modifier.fillMaxWidth().height(180.dp)
            )

            OutlinedButton(
                onClick = { if (avisoAceptado) abrirSelector() else mostrarAviso = true },
                enabled = !procesando && !enviando,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (procesando) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                else Text(if (foto == null) "Adjuntar fotografía (Opcional)" else "Cambiar fotografía")
            }
            Text(
                "Solo fotografías del lugar. Nunca de niñas, niños ni adolescentes.",
                style = MaterialTheme.typography.bodySmall
            )

            foto?.let { f ->
                val miniatura = remember(f) {
                    BitmapFactory.decodeByteArray(
                        f.bytes, 0, f.bytes.size,
                        BitmapFactory.Options().apply { inSampleSize = 4 }
                    )?.asImageBitmap()
                }
                miniatura?.let {
                    Image(
                        bitmap = it,
                        contentDescription = "Fotografía adjunta",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .clip(RoundedCornerShape(12.dp))
                    )
                }
                TextButton(onClick = { onFotoSeleccionada(null) }, enabled = !enviando) {
                    Text("Quitar fotografía")
                }
            }
            errorFoto?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        }

        // Mensajes de estado y botón, fijos abajo.
        if (envio is EnvioUiState.Error) {
            Text(envio.message, color = MaterialTheme.colorScheme.error)
        }
        if (envio is EnvioUiState.SubiendoImagen) {
            Text("Subiendo fotografía…", style = MaterialTheme.typography.bodySmall)
        }
        BotonPrincipal(
            texto = "Enviar Reporte",
            onClick = onEnviar,
            enabled = puedeEnviar,
            cargando = enviando
        )
    }

    if (mostrarAviso) {
        AlertDialog(
            onDismissRequest = { mostrarAviso = false },
            title = { Text("Antes de adjuntar una foto") },
            text = {
                Text(
                    "Adjunta solo fotografías del lugar (la calle, la fachada, el negocio). " +
                            "No incluyas a niñas, niños ni adolescentes, ni a otras personas. " +
                            "No pongas en riesgo tu seguridad para tomar la foto."
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    avisoAceptado = true
                    mostrarAviso = false
                    abrirSelector()
                }) { Text("Entendido") }
            },
            dismissButton = { TextButton(onClick = { mostrarAviso = false }) { Text("Cancelar") } }
        )
    }
}