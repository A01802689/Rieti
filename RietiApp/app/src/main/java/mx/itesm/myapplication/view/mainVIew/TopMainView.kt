package mx.itesm.myapplication.view.mainVIew

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import mx.itesm.myapplication.R
import mx.itesm.myapplication.ui.theme.DegradadoEncabezado
import mx.itesm.myapplication.ui.theme.DegradadoEncabezadoOscuro
import androidx.compose.foundation.layout.statusBarsPadding
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.viewModel.AuthViewModel

/**
 * Barra superior de la pantalla principal
 *
 * Muestra el logotipo de SIPINNA junto con los títulos de la pantalla y el botón para cerrar sesión,
 * que además regresa al login
 *
 * @param navController Controlador de navegación para ir al login al cerrar sesión
 * @param modifier [Modifier] opcional para personalizar el diseño
 */
@Composable
fun TopMainView(navController: NavController, modifier: Modifier = Modifier) {
    val authVm: AuthViewModel = viewModel()
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(if (isSystemInDarkTheme()) DegradadoEncabezadoOscuro else DegradadoEncabezado)
            .statusBarsPadding()
            .clip(RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo_sipinna),
                contentDescription = "Logo SIPINNA",
                modifier = Modifier.size(52.dp),
                contentScale = ContentScale.Fit
            )
            Column {
                Text(
                    "Sistema RIETI",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White
                )
                Text(
                    "Mis Reportes",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
        }

        IconButton(
            onClick = {
                authVm.logout()
                navController.navigate(Pantalla.Login.ruta) {
                    popUpTo(0) { inclusive = true }
                }
            }
        ) {
            Icon(
                Icons.AutoMirrored.Filled.Logout,
                contentDescription = "Cerrar sesión",
                tint = Color.White
            )
        }
    }
}
