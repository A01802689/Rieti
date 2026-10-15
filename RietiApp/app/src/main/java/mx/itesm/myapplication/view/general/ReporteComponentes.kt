package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import mx.itesm.myapplication.viewModel.MunicipiosUiState

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

/**
 * Selector desplegable de municipio. Muestra el estado de carga o un botón para reintentar
 * si no se pudo obtener la lista.
 *
 * @param seleccionado Nombre del municipio elegido; vacío si no hay selección.
 * @param estado Estado de la carga de municipios.
 * @param onSeleccion Se llama con el nombre exacto del municipio elegido.
 * @param onReintentar Vuelve a pedir la lista al backend.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SelectorMunicipio(
    seleccionado: String,
    estado: MunicipiosUiState,
    onSeleccion: (String) -> Unit,
    onReintentar: () -> Unit,
    modifier: Modifier = Modifier
) {
    when (estado) {
        MunicipiosUiState.Loading -> OutlinedTextField(
            value = "",
            onValueChange = {},
            readOnly = true,
            enabled = false,
            label = { Text("Municipio*") },
            placeholder = { Text("Cargando municipios…") },
            trailingIcon = { CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp) },
            modifier = modifier.fillMaxWidth()
        )

        is MunicipiosUiState.Error -> Column(modifier = modifier.fillMaxWidth()) {
            Text(estado.message, color = MaterialTheme.colorScheme.error)
            TextButton(onClick = onReintentar) { Text("Reintentar") }
        }

        is MunicipiosUiState.Success -> {
            var expandido by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expandido,
                onExpandedChange = { expandido = it },
                modifier = modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = seleccionado,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Municipio*") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expandido) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(expanded = expandido, onDismissRequest = { expandido = false }) {
                    estado.municipios.forEach { municipio ->
                        DropdownMenuItem(
                            text = { Text(municipio.nombre) },
                            onClick = {
                                onSeleccion(municipio.nombre)
                                expandido = false
                            }
                        )
                    }
                }
            }
        }
    }
}