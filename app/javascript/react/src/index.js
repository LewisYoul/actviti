import { define } from 'remount'      
import Map from "./components/Map"
import Welcome from "./components/Welcome"
// import Popover from "./components/Popover"

define({ 'map-component': Map })
define({ 'welcome-component': Welcome })
// define({ 'popover-component': { component: Popover, attributes: ['links'] }})