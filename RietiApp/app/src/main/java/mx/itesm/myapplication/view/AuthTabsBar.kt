package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState

@Composable
fun AuthTabsBar(navController: NavHostController, modifier: Modifier = Modifier) {
    val pilaNavegacion by navController.currentBackStackEntryAsState()
    val pantallaActual = pilaNavegacion?.destination

    Row(modifier = modifier
        .fillMaxWidth()
        .padding(top = 60.dp)) {
        Pantalla.listaPantallas.forEach { pantalla ->
            val seleccionada = pantallaActual?.route == pantalla.ruta

            TextButton(
                onClick = {
                    navController.navigate(pantalla.ruta) {
                        popUpTo(navController.graph.startDestinationId) {
                            saveState = true
                            inclusive = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = pantalla.etiqueta,
                    fontWeight = if (seleccionada) FontWeight.Bold else FontWeight.Normal,
                    color = if (seleccionada) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}