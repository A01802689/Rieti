package mx.itesm.myapplication.view.MainVIew

import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
@Composable
fun MainView(navController: NavController, modifier: Modifier = Modifier): Unit{
    Scaffold(
        modifier,
//        topBar = { TopMainView(navController, modifier) },
        content = { TopMainView(navController, modifier) },
//        content = ContentMainView(),
//        bottomBar = GenerateReport()
    )
}