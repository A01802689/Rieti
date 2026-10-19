package mx.itesm.myapplication.view.general

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.ResultadoUbicacion
import mx.itesm.myapplication.data.network.obtenerUbicacionActual
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
    paso: Int? = null,
    totalPasos: Int? = null,
    contenido: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 20.dp, vertical = 12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onVolver) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Volver",
                    tint = MaterialTheme.colorScheme.secondary
                )
            }
            Spacer(Modifier.weight(1f))
            if (paso != null && totalPasos != null) {
                Text(
                    "Paso $paso de $totalPasos",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        if (paso != null && totalPasos != null) {
            LinearProgressIndicator(
                progress = { paso / totalPasos.toFloat() },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.outlineVariant
            )
            Spacer(Modifier.height(16.dp))
        }
        Text(titulo, style = MaterialTheme.typography.titleLarge)
        if (subtitulo != null) {
            Text(subtitulo, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Spacer(Modifier.height(20.dp))
        contenido()
    }
}

@Composable
fun BotonPrincipal(
    texto: String,
    onClick: () -> Unit,
    enabled: Boolean = true,
    cargando: Boolean = false
) {
    Box(
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Button(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.fillMaxWidth().widthIn(max = 480.dp).heightIn(min = 52.dp)
        ) {
            if (cargando) CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary
            ) else Text(texto, style = MaterialTheme.typography.labelLarge)
        }
    }
}

/** Diálogo que muestra el folio devuelto por el backend. No se puede cerrar tocando fuera. */
@Composable
fun DialogoReporteEnviado(
    folio: String?,
    mensaje: String = if (folio != null) "Tu folio es: $folio" else "Gracias por tu reporte",
    onAceptar: () -> Unit
) {
    AlertDialog(
        onDismissRequest = {},
        title = { Text("Reporte enviado") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(mensaje)
            }
        },
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

/** Botón "Usar mi ubicación actual": pide permiso, lee el GPS y entrega coordenadas y dirección sugerida. */
@Composable
fun BotonUbicacionActual(
    onUbicacion: (Double, Double) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var cargando by remember { mutableStateOf(false) }
    var mensaje by remember { mutableStateOf<String?>(null) }

    fun buscar() {
        scope.launch {
            cargando = true
            mensaje = null
            when (val r = obtenerUbicacionActual(context)) {
                is ResultadoUbicacion.Ok -> onUbicacion(
                    r.latitud, r.longitud,
                )
                ResultadoUbicacion.SinPermiso ->
                    mensaje = "Sin permiso de ubicación. Puedes marcar el lugar en el mapa."
                ResultadoUbicacion.NoDisponible ->
                    mensaje = "No se pudo obtener tu ubicación. Revisa que esté activada o márcala en el mapa."
            }
            cargando = false
        }
    }

    val lanzador = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permisos ->
        if (permisos.values.any { it }) buscar()
        else mensaje = "Sin permiso de ubicación. Puedes marcar el lugar en el mapa."
    }

    Column(modifier = modifier) {
        OutlinedButton(
            onClick = {
                lanzador.launch(
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                )
            },
            enabled = !cargando,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (cargando) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
            else Text("Usar mi ubicación actual")
        }
        mensaje?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
    }
}