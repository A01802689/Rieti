package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import mx.itesm.myapplication.viewModel.EnvioUiState

/**
 * Pantalla para redactar y enviar un reporte.
 *
 * Muestra un formulario con tres elementos principales:
 * - Un campo de texto multilínea para describir la situación a reportar.
 * - Un botón para adjuntar una fotografía (pendiente de implementar: abrirá la galería).
 * - Un botón para enviar el reporte (pendiente de implementar: enviará los datos).
 *
 * @param modifier [Modifier] aplicado al contenedor raíz ([Column]) de la pantalla.
 */
@Composable
fun Enviar(
    descripcion: String,
    onDescripcionChange: (String) -> Unit,
    envio: EnvioUiState,
    puedeEnviar: Boolean,
    onEnviar: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
    ) {
        OutlinedTextField(
            value = descripcion,
            onValueChange = onDescripcionChange,
            label = { Text("Describe la situación") },
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
        )
        Spacer(modifier = Modifier.height(20.dp))
        OutlinedButton(
            onClick = {
                // luego abrir galería
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text("Adjuntar fotografía") }

        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = onEnviar,
            enabled = puedeEnviar,
            modifier = Modifier.fillMaxWidth()
        ) {
            if( envio is EnvioUiState.Loading)
                CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
            else
                Text("Enviar reporte")
        }
    }
}