import Vue from 'vue'
import VueRouter from 'vue-router'
import Cleaners from '../components/Cleaners.vue'
import Schedule from '../components/CleaningSchedule.vue'

Vue.use(VueRouter)

export default new VueRouter({
	routes: [
		{ path: '/cleaners', component: Cleaners },
		{ path: '/schedule', component: Schedule }
	]
})