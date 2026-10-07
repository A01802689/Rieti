package mx.itesm.myapplication.view.seguimiento

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import mx.itesm.myapplication.view.general.Ubicacion

@Composable
fun SeguimientoUbicacion(navController: NavController) {

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = {
                navController.popBackStack()
            })
            {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Volver"
                )
            }
            Text(text = "Volver")
        }
        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Reporte con Seguimiento",
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Recibiras tu folio por correo o WhatsApp"
        )
        Spacer(modifier = Modifier.height(15.dp))

        Ubicacion(navController = navController,
            modifier = Modifier)

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {
                navController.navigate("SegEnviar")
            }, modifier = Modifier.fillMaxWidth()
        ) {Text("Continuar") }
    }
}

@Preview(showBackground = true)
@Composable
fun PrevUbicacion(){
    SeguimientoUbicacion(navController = rememberNavController())
}