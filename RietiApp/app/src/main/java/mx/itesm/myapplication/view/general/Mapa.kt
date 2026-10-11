package mx.itesm.myapplication.view.seguimiento

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.unit.dp
import com.mapbox.geojson.Point
import com.mapbox.maps.Style
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberMapViewportState
import com.mapbox.maps.extension.compose.style.MapStyle

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
    modifier: Modifier = Modifier
) {
    if (LocalInspectionMode.current) {
        // Marcador de posición para la vista previa de Android Studio.
        Box(
            modifier = modifier
                .fillMaxWidth()
                .height(250.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Mapa Interactivo (Vista Previa)",
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        /** Estado de la cámara del mapa, con la posición y el zoom iniciales. */
        val mapViewportState = rememberMapViewportState {
            setCameraOptions {
                center(Point.fromLngLat(-99.2152, 19.5598))
                zoom(12.5)
            }
        }

        MapboxMap(
            modifier = modifier
                .fillMaxWidth()
                .height(250.dp)
                .clip(RoundedCornerShape(12.dp)),
            mapViewportState = mapViewportState,
            style = {
                MapStyle(style = Style.MAPBOX_STREETS)
            }
        )
    }
}