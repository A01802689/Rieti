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


@Composable
fun ReporteSeguimiento(navController: NavController)
{
    var nombre by remember { mutableStateOf("") }
    var apellidos by remember { mutableStateOf("") }
    var numero by remember { mutableStateOf("") }
    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp)
    ) {
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
            onClick = {},
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