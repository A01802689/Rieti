package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import mx.itesm.myapplication.viewModel.AuthUiState
import mx.itesm.myapplication.viewModel.AuthViewModel

/**
 * Formulario de inicio de sesión de usuario.
 *
 * Muestra los campos de texto para correo electrónico y contraseña con soporte de desplazamiento vertical.
 *
 * @param navController Controlador de navegación [NavHostController].
 * @param authViewModel Instancia de [AuthViewModel] inyectada o proveída.
 */
@Composable
fun LoginForm(
    navController: NavHostController,
    authViewModel: AuthViewModel = viewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var localError by remember { mutableStateOf<String?>(null) }

    val visible = remember { mutableStateOf(false) }
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
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(text = "CORREO ELECTRÓNICO")
            Spacer(modifier = Modifier.height(6.dp))
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

            Spacer(modifier = Modifier.height(14.dp))

            Text(text = "CONTRASEÑA")
            Spacer(modifier = Modifier.height(6.dp))
            TextField(
                value = password,
                onValueChange = {
                    password = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                isError = localError != null || uiState is AuthUiState.Error,
                visualTransformation = if (visible.value) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { visible.value = !visible.value }) {
                        Icon(
                            imageVector = if (visible.value) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            contentDescription = if (visible.value) "Ocultar contraseña" else "Mostrar contraseña"
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth().testTag("passwordInput")
            )

            val displayedError = localError ?: (uiState as? AuthUiState.Error)?.message
            if (displayedError != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = displayedError,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.testTag("errorMessage")
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

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
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Iniciar sesión")
                }
            }
        }
    }
}

/**
 * Formulario para el registro de nuevos usuarios en la plataforma.
 *
 * Incluye scroll vertical (`verticalScroll`) y espaciado compacto para garantizar que
 * todos los campos y el botón "Crear cuenta" sean visibles en cualquier pantalla.
 *
 * @param navController Controlador de navegación [NavHostController].
 * @param authViewModel Instancia de [AuthViewModel] inyectada o proveída.
 */
@Composable
fun RegisterForm(
    navController: NavHostController,
    authViewModel: AuthViewModel = viewModel()
) {
    var nombre by remember { mutableStateOf("") }
    var apellido by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var localError by remember { mutableStateOf<String?>(null) }

    val visible = remember { mutableStateOf(false) }
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
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Text(text = "NOMBRE(S)")
            Spacer(modifier = Modifier.height(6.dp))
            TextField(
                value = nombre,
                onValueChange = {
                    nombre = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(text = "APELLIDOS")
            Spacer(modifier = Modifier.height(6.dp))
            TextField(
                value = apellido,
                onValueChange = {
                    apellido = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(text = "CORREO ELECTRÓNICO")
            Spacer(modifier = Modifier.height(6.dp))
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

            Spacer(modifier = Modifier.height(12.dp))

            Text(text = "CONTRASEÑA")
            Spacer(modifier = Modifier.height(6.dp))
            TextField(
                value = password,
                onValueChange = {
                    password = it
                    if (localError != null) localError = null
                    if (uiState is AuthUiState.Error) authViewModel.resetState()
                },
                visualTransformation = if(visible.value) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { visible.value = !visible.value }) {
                        Icon(
                            imageVector = if (visible.value) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            contentDescription = if (visible.value) "Ocultar contraseña" else "Mostrar contraseña"
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )

            val displayedError = localError ?: (uiState as? AuthUiState.Error)?.message
            if (displayedError != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = displayedError,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    if (nombre.isBlank() || apellido.isBlank() || email.isBlank() || password.isBlank()) {
                        localError = "Por favor, completa todos los campos"
                    } else {
                        localError = null
                        authViewModel.registrar(
                            nombre = nombre.trim(),
                            apellido = apellido.trim(),
                            correo = email.trim(),
                            contrasena = password.trim()
                        )
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

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
