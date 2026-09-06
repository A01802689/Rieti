package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController

@Composable
fun AuthScaffold(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            Column {
                Spacer(modifier = Modifier.height(80.dp))
                AppHeader()
                Spacer(modifier = Modifier.height(16.dp))
                AuthTabsBar(navController)
            }
        },
        content = content
    )
}
