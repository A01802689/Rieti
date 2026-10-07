package mx.itesm.myapplication.view.anonimo

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.Enviar

@Composable
fun AnonimoEnviar(navController: NavController){

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
            text = "Reporte Anónimo",
            fontWeight = FontWeight.Bold
        )

        Enviar(navController = navController,
            modifier = Modifier)
    }
}

@Preview (showBackground = true)
@Composable
fun AnonimoEnvPrev(){
    AnonimoEnviar(navController = rememberNavController())
}