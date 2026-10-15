package mx.itesm.myapplication.view.general

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.unit.dp
import org.maplibre.compose.camera.CameraPosition
import org.maplibre.compose.camera.rememberCameraState
import org.maplibre.compose.map.MaplibreMap
import org.maplibre.compose.style.BaseStyle
import org.maplibre.compose.util.ClickResult
import org.maplibre.spatialk.geojson.Position
import kotlin.time.Duration.Companion.seconds

/**
 * Mapa interactivo de Mapbox con esquinas redondeadas y altura fija de 250 dp.
 *
 * Cuando el composable se renderiza en el modo de inspección de Android Studio
 * ([LocalInspectionMode], por ejemplo en `@Preview`), no se carga el mapa real: se muestra
 * en su lugar un recuadro con el texto "Mapa Interactivo (Vista Previa)". Esto evita los
 * problemas de renderizado que tiene [MapboxMap] en las vistas previas.
 *
 * @param modifier Modificador opcional de diseño.
 */

@Composable
fun MapaInteractivo(
    latitud: Double?,
    longitud: Double?,
    onUbicacionSeleccionada: (Double, Double) -> Unit,
    modifier: Modifier = Modifier
) {
    val mapModifier = modifier.fillMaxWidth().height(250.dp).clip(RoundedCornerShape(12.dp))

    if (LocalInspectionMode.current) {
        // Marcador de posición para la vista previa de Android Studio.
        Box(
            modifier = mapModifier.background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Text(text = "Mapa Interactivo (Vista Previa)",) }
    } else {
        /** Estado de la cámara del mapa, con la posición y el zoom iniciales. */
        val camara = rememberCameraState(
            firstPosition = CameraPosition(
                target = Position(latitude = 19.5598, longitude = -99.2152),
                zoom = 12.5
            )
        )
        LaunchedEffect(latitud, longitud) {
            if (latitud != null && longitud != null) {
                camara.animateTo(
                    finalPosition = camara.position.copy(
                        target = Position(latitude = latitud, longitude = longitud), zoom = 16.0
                    ),
                    duration = 1.seconds
                )
            }
        }
        MaplibreMap(modifier = mapModifier, baseStyle = BaseStyle.Uri("https://tiles.openfreemap.org/styles/liberty"), cameraState = camara, onMapClick = { posicion, _ ->
                onUbicacionSeleccionada(posicion.latitude, posicion.longitude)
                ClickResult.Consume
            },
            onMapLoadFailed = { motivo -> Log.e("Mapa", "Fallo al cargar el mapa: $motivo")
            },
            onMapLoadFinished = { Log.d("Mapa", "Mapa cargado") })
    }
}