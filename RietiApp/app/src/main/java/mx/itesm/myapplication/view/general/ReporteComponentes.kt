package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/**
 * Estructura común de un paso del reporte: fila de regreso, título, subtítulo opcional y contenido.
 *
 * @param titulo Título en negritas.
 * @param onVolver Acción del botón de regreso.
 * @param subtitulo Texto opcional debajo del título.
 * @param contenido Contenido del paso. Puede usar `Modifier.weight(1f)` (es un [ColumnScope]).
 */
@Composable
fun PasoReporte(
    titulo: String,
    onVolver: () -> Unit,
    subtitulo: String? = null,
    contenido: @Composable ColumnScope.() -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onVolver) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
            }
            Text("Volver")
        }
        Spacer(Modifier.height(10.dp))
        Text(titulo, fontWeight = FontWeight.Bold)
        if (subtitulo != null) Text(subtitulo)
        Spacer(Modifier.height(20.dp))
        contenido()
    }
}

/** Botón ancho de avance, habilitado solo cuando el paso está completo. */
@Composable
fun BotonContinuar(enabled: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
    ) { Text("Continuar") }
}

/** Diálogo que muestra el folio devuelto por el backend. No se puede cerrar tocando fuera. */
@Composable
fun DialogoReporteEnviado(folio: String, onAceptar: () -> Unit) {
    AlertDialog(
        onDismissRequest = {},
        title = { Text("Reporte enviado") },
        text = { Text("Folio del reporte: $folio") },
        confirmButton = { TextButton(onClick = onAceptar) { Text("Aceptar") } }
    )
}