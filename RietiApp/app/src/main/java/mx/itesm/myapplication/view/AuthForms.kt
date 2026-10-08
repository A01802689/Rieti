package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import mx.itesm.myapplication.viewModel.AuthUiState
import mx.itesm.myapplication.viewModel.AuthViewModel

@Composable
fun LoginForm(
    navController: NavHostController,
    authViewModel: AuthViewModel = viewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var localError by remember { mutableStateOf<String?>(null) }

    val uiState by authViewModel.uiState.collectAsState()

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            authViewModel.resetState()
            navController.navigate(Pantalla.RUTA_MAIN) {
                popUpTo(Pantalla.RUTA_LOGIN) { inclusive = true }
            }
        }
    }

    AuthScaffold(navController) { innerPadding ->
        Column(modifier = Modifier.fillMaxWidth().padding(innerPadding).padding(16.dp)) {
            Text(text = "CORREO ELECTRÓNICO")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = email,
                onValueChange = {
                    email = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                isError = localError != null || uiState is AuthUiState.Error,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth().testTag("emailInput")
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(text = "CONTRASEÑA")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = password,
                onValueChange = {
                    password = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                isError = localError != null || uiState is AuthUiState.Error,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth().testTag("passwordInput")
            )

            val displayedError = localError ?: (uiState as? AuthUiState.Error)?.message
            if (displayedError != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = displayedError,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.testTag("errorMessage")
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        localError = "Por favor, ingresa tu correo y contraseña"
                    } else {
                        localError = null
                        authViewModel.login(email.trim(), password.trim())
                    }
                },
                enabled = uiState !is AuthUiState.Loading,
                modifier = Modifier.fillMaxWidth().testTag("loginButton")
            ) {
                if (uiState is AuthUiState.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.height(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Iniciar sesión")
                }
            }
        }
    }
}

@Composable
fun RegisterForm(
    navController: NavHostController,
    authViewModel: AuthViewModel = viewModel()
) {
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var localError by remember { mutableStateOf<String?>(null) }

    val uiState by authViewModel.uiState.collectAsState()

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            authViewModel.resetState()
            navController.navigate(Pantalla.RUTA_MAIN) {
                popUpTo(Pantalla.RUTA_REGISTER) { inclusive = true }
            }
        }
    }

    AuthScaffold(navController) { innerPadding ->
        Column(modifier = Modifier.fillMaxWidth().padding(innerPadding).padding(16.dp)) {
            Text(text = "NOMBRE COMPLETO")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = fullName,
                onValueChange = {
                    fullName = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(text = "CORREO ELECTRÓNICO")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = email,
                onValueChange = {
                    email = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(text = "CONTRASEÑA")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = password,
                onValueChange = {
                    password = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )

            val displayedError = localError ?: (uiState as? AuthUiState.Error)?.message
            if (displayedError != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = displayedError,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    val parts = fullName.trim().split(" ", limit = 2)
                    val nombre = parts.getOrNull(0) ?: ""
                    val apellido = parts.getOrNull(1) ?: ""

                    if (nombre.isBlank() || email.isBlank() || password.isBlank()) {
                        localError = "Por favor, completa todos los campos"
                    } else {
                        localError = null
                        authViewModel.registrar(nombre, apellido, correo = email.trim(), contrasena = password.trim())
                    }
                },
                enabled = uiState !is AuthUiState.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (uiState is AuthUiState.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.height(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Crear cuenta")
                }
            }
        }
    }
}
