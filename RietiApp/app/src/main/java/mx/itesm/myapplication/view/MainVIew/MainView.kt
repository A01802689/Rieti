package mx.itesm.myapplication.view.MainVIew

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@Composable
fun MainView(navController: NavController, modifier: Modifier = Modifier){
    Scaffold(
        modifier.padding(16.dp, 8.dp),
        topBar = { TopMainView(navController) },
        content = { innerPadding ->
            ContentMainView(modifier.padding(innerPadding)) },
        bottomBar = { GenerateReportMainView(navController) }
    )
}