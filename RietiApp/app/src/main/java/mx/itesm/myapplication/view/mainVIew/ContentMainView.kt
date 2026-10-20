package mx.itesm.myapplication.view.mainVIew

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import mx.itesm.myapplication.viewModel.ReporteUiState
import mx.itesm.myapplication.viewModel.ReportesUiState


/**
 * Contenido de la pantalla principal: los reportes con seguimiento del usuario como tarjetas de resumen
 *
 * Según el estado muestra un indicador de carga, un mensaje de error con botón para reintentar, un aviso de
 * lista vacía o la lista. Se puede actualizar jalando hacia abajo
 *
 * @param estado Estado de la lista de reportes
 * @param onReintentar Vuelve a pedir la lista, desde el botón de reintentar o al jalar para actualizar
 * @param modifier [Modifier] aplicado al contenedor raíz
 */
@Composable
fun ContentMainView(
    estado: ReportesUiState,
    onReintentar: () -> Unit,
    modifier: Modifier = Modifier
) {
    val reportes = estado.reportes

    PullToRefreshBox(
        isRefreshing = estado.cargando && reportes != null,
        onRefresh = onReintentar,
        modifier = modifier
    ) {
        when {
            reportes == null && estado.cargando -> Box(modifier.fillMaxSize(), Alignment.Center) {
                CircularProgressIndicator()
            }

            reportes == null -> Column(
                modifier = Modifier.fillMaxSize().padding(24.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    estado.error ?: "No se pudieron cargar tus reportes.",
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center
                )
                TextButton(onClick = onReintentar) { Text("Reintentar") }
            }

            reportes.isEmpty() -> Box(modifier.fillMaxSize().padding(24.dp), Alignment.Center) {
                Text(
                    "Aún no ha realizado ningún reporte con seguimiento.\nLos reportes que haga aparecerán aquí",
                    textAlign = TextAlign.Center
                )
            }

            else -> LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Si falló una actualización pero ya había lista, se mantiene y se avisa arriba
                if (estado.error != null) {
                    item { Text(estado.error, color = MaterialTheme.colorScheme.error) }
                }
                items(reportes, key = { it.idReporte }) { r ->
                    ReportSummaryCard(
                        folio = r.folio,
                        city = r.ciudad,
                        location = r.ubicacion,
                        tags = r.etiquetas,
                        status = r.estatus,
                        hasRisk = false, // el backend sigue sin devolver el riesgo
                        dateText = r.fecha
                    )
                }
            }
        }
    }
}
/**
 * Tarjeta con el resumen de un reporte
 *
 * @param folio Folio del reporte
 * @param city Municipio del reporte
 * @param location Calle y colonia del reporte
 * @param tags Etiquetas con la actividad, la cantidad y la edad
 * @param status Estatus de seguimiento, que se muestra en un [StatusChip]
 * @param hasRisk Si es `true` muestra un [RiskChip]
 * @param dateText Fecha del reporte ya formateada
 * @param modifier [Modifier] aplicado a la tarjeta
 */
@Composable
fun ReportSummaryCard(
    folio: String,
    city: String,
    location: String,
    tags: List<String>,
    status: String,
    hasRisk: Boolean,
    dateText: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = folio,
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.titleSmall
                )
                StatusChip(status)
            }

            Text(
                text = city,
                color = MaterialTheme.colorScheme.onSurface,
                style = MaterialTheme.typography.headlineSmall
            )

            Text(
                text = location,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                tags.forEach { tag ->
                    TagChip(tag)
                }
            }

            if (hasRisk) {
                RiskChip()
            }

            Text(
                text = dateText,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

/**
 * Etiqueta con el estatus de un reporte, con un color según el estatus
 *
 * Un estatus que no se reconoce usa los colores primarios del tema
 *
 * @param status Estatus de seguimiento, por ejemplo "Recibido" o "En revisión"
 * @param modifier [Modifier] aplicado a la etiqueta
 */
@Composable
fun StatusChip(status: String, modifier: Modifier = Modifier) {
    val (bgColor, contentColor) = when (status.lowercase().trim()) {
        "recibido" -> Pair(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.onSurfaceVariant)
        "en revisión", "en revision" -> Pair(Color(0xFFFFF8E1), Color(0xFFF57F17)) // Ámbar / Amarillo
        "canalizado" -> Pair(Color(0xFFE3F2FD), Color(0xFF1565C0))                // Azul
        "en atención", "en atencion" -> Pair(Color(0xFFFBE9E7), Color(0xFFD84315)) // Naranja oscuro
        "concluido" -> Pair(Color(0xFFE8F5E9), Color(0xFF2E7D32))                 // Verde
        else -> Pair(MaterialTheme.colorScheme.primaryContainer, MaterialTheme.colorScheme.primary)
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier
            .background(
                color = bgColor,
                shape = RoundedCornerShape(50)
            )
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(color = contentColor, shape = CircleShape)
        )
        Text(text = status, color = contentColor)
    }
}

/**
 * Etiqueta redondeada con un texto
 *
 * @param text Texto de la etiqueta
 * @param modifier [Modifier] aplicado a la etiqueta
 */
@Composable
fun TagChip(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.surfaceContainerHighest,
                shape = RoundedCornerShape(50)
            )
            .padding(horizontal = 12.dp, vertical = 6.dp)
    )
}

/**
 * Etiqueta que avisa que se reportó una situación de riesgo
 *
 * @param modifier [Modifier] aplicado a la etiqueta
 */
@Composable
fun RiskChip(modifier: Modifier = Modifier) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.errorContainer,
                shape = RoundedCornerShape(50)
            )
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Icon(
            imageVector = Icons.Filled.Warning,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error
        )
        Text(text = "Riesgo reportado", color = MaterialTheme.colorScheme.error)
    }
}