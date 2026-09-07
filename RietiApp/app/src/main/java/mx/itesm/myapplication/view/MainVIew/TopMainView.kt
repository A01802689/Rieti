package mx.itesm.myapplication.view.MainVIew

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun TopMainView(navController: NavController, modifier: Modifier = Modifier): Unit {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.padding(horizontal = 0.dp, vertical = 5.dp)) {
            Text(
                "Sistema RIETI",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = modifier
                    .padding(3.dp),
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                "Mis Reportes",
                color = MaterialTheme.colorScheme.onBackground,
                modifier = modifier
                    .padding(3.dp),
                style = MaterialTheme.typography.titleMedium
            )

        }
        Button(onClick = { navController.navigate(route = "login") }) {
            Icon(imageVector = Icons.AutoMirrored.Filled.Logout, contentDescription = "Logout")
        }
    }
}