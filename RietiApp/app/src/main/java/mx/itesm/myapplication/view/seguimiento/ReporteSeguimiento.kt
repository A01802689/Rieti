package mx.itesm.myapplication.view.seguimiento

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController

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
fun ReporteSeguimiento(navController: NavController)
{
    /** Nombre(s) del usuario. Vacío si no se ha capturado. */
    var nombre by remember { mutableStateOf("") }

    /** Apellidos del usuario. Vacío si no se han capturado. */
    var apellidos by remember { mutableStateOf("") }

    /** Número de teléfono del usuario. Vacío si no se ha capturado. */
    var numero by remember { mutableStateOf("") }
    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp)
    ) {
        // Fila de encabezado con el botón para regresar.
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = {navController.popBackStack()
            })
            {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Volver"
                )
            }
            Text(text = "Volver")
        }
        Spacer(modifier = Modifier.height(15.dp))

        Text(
            text = "Reporte con Seguimiento",
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Recibiras tu folio por correo o WhatsApp"
        )

        Spacer(modifier = Modifier.height(15.dp))

        // Tarjeta informativa sobre el uso de los datos solicitados.
        Card(
            colors = CardDefaults.cardColors(containerColor = Color.Gray)
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null
                )
                Text(
                    text = "Estos datos son para identificar tu reporte y contactarte sobre tu avance"
                )
            }
        }
        Spacer(modifier = Modifier.height(15.dp))

        OutlinedTextField(
            value = nombre,
            onValueChange = { nombre = it},
            label = {Text("Nombre(s)*")},
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(15.dp))
        OutlinedTextField(
            value = apellidos,
            onValueChange = { apellidos = it},
            label = {Text("Apellidos*")},
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(15.dp))
        OutlinedTextField(
            value = numero,
            onValueChange = { numero = it},
            label = {Text("Número de teléfono*")},
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = {
                navController.navigate(route = "SegFormulario")
            },
            modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(15.dp    )
        ) {Text("Continuar") }
    }
}

@Preview(showBackground = true)
@Composable
fun ReportePrev() {
    ReporteSeguimiento(
        navController = rememberNavController()
    )
}