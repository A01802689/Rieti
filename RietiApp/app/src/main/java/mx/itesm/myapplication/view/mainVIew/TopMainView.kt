package mx.itesm.myapplication.view.mainVIew

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import mx.itesm.myapplication.R
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.viewModel.AuthViewModel

/**
 * Barra superior de la pantalla principal.
 *
 * Muestra el logotipo institucional de RIETI junto con los títulos de la pantalla
 * y el botón para cerrar sesión / volver al inicio.
 *
 * @param navController Controlador de navegación para manejar la navegación entre pantallas.
 * @param modifier [Modifier] opcional para personalizar el diseño.
 */
@Composable
fun TopMainView(navController: NavController, modifier: Modifier = Modifier) {
    val authVm: AuthViewModel = viewModel()
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Fila que contiene la imagen a la izquierda y los textos a la derecha
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo_rieti_atizapan),
                contentDescription = "Logo RIETI",
                contentScale = ContentScale.Fit,
                modifier = Modifier.height(48.dp)
            )

            Column(modifier = Modifier.padding(vertical = 5.dp)) {
                Text(
                    text = "Sistema RIETI",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = "Mis Reportes",
                    color = MaterialTheme.colorScheme.onBackground,
                    style = MaterialTheme.typography.titleMedium
                )
            }
        }

        Button(onClick = {
            authVm.logout() // Limpia cookies y SesionUsuario
            navController.navigate(Pantalla.RUTA_LOGIN) {
                popUpTo(0) {inclusive = true }
            }
            })
        {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Logout,
                contentDescription = "Logout"
            )
        }
    }
}
