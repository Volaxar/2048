import '../scss/style.scss'

import GameManager from './game_manager'
import MouseInputManager from './mouse_input_manager'
import HtmlActuator from './html_actuator'
import LocalStorageManager from './local_storage_manager'

window.requestAnimationFrame(function () {
    new GameManager(4, MouseInputManager, HtmlActuator, LocalStorageManager);
});
