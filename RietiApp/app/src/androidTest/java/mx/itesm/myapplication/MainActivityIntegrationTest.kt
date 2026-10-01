package mx.itesm.myapplication

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.runners.AndroidJUnit4
import mx.itesm.myapplication.view.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MainActivityIntegrationTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun cuandoEscriboCorreoYContrasena_navega_MenuPrincipal() {
        val correo = "rieti@sipinna.com"
        val contrasena = "CONTRASENA123"

        // 1. Escribir el correo electrónico
        composeTestRule.onNodeWithTag("emailInput")
            .performTextInput(correo)

        // 2. Escribir la contraseña
        composeTestRule.onNodeWithTag("passwordInput")
            .performTextInput(contrasena)

        // 3. Hacer clic en el botón de Iniciar sesión
        composeTestRule.onNodeWithTag("loginButton")
            .performClick()

        // 4. Verificar que navegó a la segunda pantalla (MainView)
        composeTestRule.onNodeWithText("Sistema RIETI")
            .assertIsDisplayed()
    }

    @Test
    fun cuandoCamposVacios_muestraMensajeError_yNoNavega() {
        // 1. Dar clic en el botón sin haber ingresado datos
        composeTestRule.onNodeWithTag("loginButton")
            .performClick()

        // 2. Verificar que aparezca el mensaje de error
        composeTestRule.onNodeWithText("Por favor, ingresa tu correo y contraseña")
            .assertIsDisplayed()

        // 3. Verificar que NO haya navegado a la pantalla principal
        composeTestRule.onNodeWithText("Sistema RIETI")
            .assertDoesNotExist()
    }
}