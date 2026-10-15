package mx.itesm.myapplication.view.seguimiento

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.BotonContinuar
import mx.itesm.myapplication.view.general.PasoReporte
import mx.itesm.myapplication.viewModel.ReporteViewModel

/**
 * Pantalla de datos de contacto para un reporte con seguimiento.
 *
 * Es el primer paso del flujo de reporte con seguimiento. Muestra:
 * - Una fila superior con un botón para regresar.
 * - El título "Reporte con Seguimiento" y un texto que indica que el folio se recibirá por
 *   correo o WhatsApp.
 * - Una tarjeta informativa que explica para qué se piden los datos.
 * - Tres campos de texto: nombre(s), apellidos y número de teléfono. Los tres están marcados
 *   como obligatorios con un asterisco en su etiqueta.
 * - Un botón "Continuar" anclado en la parte inferior mediante un [Spacer] con peso.
 *
 * @param navController Controlador de navegación para manejar la navegación entre pantallas.
 */

@Composable
fun ReporteSeguimiento(navController: NavController, vm: ReporteViewModel)
{
    val state by vm.uiState.collectAsState()
    LaunchedEffect(Unit) { vm.setEsAnonimo(false) }
    PasoReporte(
        titulo = "Reporte con Seguimiento",
        onVolver = { navController.popBackStack() }
    ) {
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Icon(Icons.Default.Info, contentDescription = null)
                Text(text = "Estos datos son para identificar tu reporte y contactarte sobre tu avance")
            }
        }
        Spacer(modifier = Modifier.height(15.dp))
        Column(
            modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(15.dp)
        ){
            OutlinedTextField(
                value = state.nombre, onValueChange = vm::setNombre,
                label = {Text("Nombre(s)*")},
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = state.apellidos, onValueChange = vm::setApellidos,
                label = {Text("Apellidos*")},
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = state.telefono, onValueChange = vm::setTelefono,
                label = {Text("Número de teléfono*")},
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words),
                modifier = Modifier.fillMaxWidth()
            )
        }
        BotonContinuar(enabled = state.contactoValido) {
            navController.navigate(Pantalla.RUTA_SEGFORM)
        }
    }
}