<template>
	<div class="container-fluid container-md d-flex justify-content-center">
		<div class="schedule-wrapper col-xl-8 col-lg-9 col-md-10 col-12 mt-5">
		
			<ul class="schedule list-group">
				<app-item v-for="item in scheduleList"
									:key="item.id"
									:item="item"
									@update-item="updateItem($event)"></app-item>
			</ul>

		</div>
	</div>
</template>

<script>
	import ScheduleItem from './ScheduleItem.vue'

	export default {
		data () {
			return {
				scheduleList: [],		// список элементов графика уборки
				minTime: null,			// начало рабочего дня
				maxTime: null				// конец рабочего дня
			}
		},

		created () {
			
			/**
			 * Пытаемся получить список элементов графика из localStorage
			 */
			if (localStorage.getItem('scheduleList')) {
				try {
					this.scheduleList =  JSON.parse(localStorage.getItem('scheduleList'))
				} catch (e) {
					localStorage.removeItem('scheduleList')
				}
			}

			/**
			 * Устанавливаем начало и конец рабочего дня
			 */
			this.minTime = new Date()
			this.maxTime = new Date()
			this.minTime.setHours(8, 0, 0)
			this.maxTime.setHours(17, 0, 0)

			this.fillScheduleList()

		},

		mounted () {
			
			/**
			 * Запуск таймера при монтировании компонента
			 */
			this.startTimer()
		},

		beforeDestroy () {
			
			/**
			 * Остановка таймера перед уничтожением компонента
			 */
			this.stopTimer()
		},

		methods: {

			/**
			 * Получить ID для нового элемента графика уборки
			 * @return {Number}  	ID нового элемента графика уборки
			 */
			getNextId () {
				let nextId

				if (localStorage.getItem('nextItemId')) {
					nextId = localStorage.getItem('nextItemId')
				} else {
					nextId = 0
				}

				localStorage.setItem('nextItemId', ++nextId)

				return nextId
			},

			/**
			 * Заполнение списка элементов графика уборки
			 */
			fillScheduleList () {
				let timeNow = new Date(),				// время в данный момент
						startItemTime = new Date()	// время, с которого нужно обновить график

				if (!this.scheduleList.length) {	
					startItemTime = this.minTime	// если график еще не создан, заполняем его с начала рабочего дня

				} else {
					let lastItem = this.scheduleList[this.scheduleList.length - 1]
					startItemTime.setHours(lastItem.hours, lastItem.minutes, 0)		// иначе заполняем с последнего времени в списке
				}

				let newItemHours = startItemTime.getHours(),
						newItemMinutes = startItemTime.getMinutes()

				while (newItemHours < 17) {
					// дополняем список элементов графика уборки до конца рабочего дня
					newItemMinutes = Number(newItemMinutes) + 15
					if (newItemMinutes == 60) {
						newItemHours++
						newItemMinutes = 0
					}

					if (newItemHours < 10)
						newItemHours = '0' + Number(newItemHours)

					if (newItemMinutes == 0)
						newItemMinutes = '00'

					let newItem = {
						id: this.getNextId(),
						disabled: true,
						isChecked: false,
						hours: newItemHours,
						minutes: newItemMinutes,
						cleanerName: ''
					}

					this.scheduleList.push(newItem)
				}

				this.updateScheduleList()
			},

			/**
			 * Обновление списка элементов графика уборки
			 */
			updateScheduleList () {
				let timeNow = new Date()							// время в данный момент

				this.scheduleList.forEach( item => {
					let itemTime = new Date()
					itemTime.setHours(item.hours, item.minutes, 0)

					if (itemTime <= timeNow && !item.cleanerName)		// отключаем редактирование всех проведенных уборок до настоящего времени
						item.disabled = false

					if(itemTime > timeNow) {
						item.disabled = true
						item.isChecked = false
						item.cleanerName = ''
					}
				})

				if (timeNow < this.minTime) {
					// если время в промежутке от 00:00 до 08:00, то сбрасываем график к дефолту
					this.scheduleList.forEach( item => {
						item.disabled = true
						item.isChecked = false
						item.cleanerName = ''
					})
				}

				this.saveScheduleListToLocalStorage()
			},

			/**
			 * Обновить список элементов графика уборки в localStorage
			 */
			saveScheduleListToLocalStorage () {
				localStorage.setItem('scheduleList', JSON.stringify(this.scheduleList))
			},

			/**
			 * Остановить таймер проверки времени
			 */
			stopTimer () {
				if (this.interval) {
					window.clearInterval(this.interval)
				}
			},

			/**
			 * Запустить таймер проверки времени
			 */
			startTimer () {
				this.stopTimer()
				this.interval = window.setInterval( () => {
					this.updateScheduleList()
				}, 1000)
			},

			/**
			 * Обновить элемент(после добавления имени уборщика и отметки о проведении уборки)
			 * @param  {Object} newItem 	Обновленный элемент
			 */
			updateItem (newItem) {
				this.scheduleList = this.scheduleList.filter( item => item.id != newItem.id)
				this.scheduleList.push(newItem)
				this.scheduleList.sort( (item1, item2) => {
						let time1 = new Date(),
								time2 = new Date()
						time1.setHours(item1.hours, item1.minutes, 0)
						time2.setHours(item2.hours, item2.minutes, 0)

						return time1 - time2
					})

				this.saveScheduleListToLocalStorage()
			}
		},

		components: {
			'app-item': ScheduleItem
		}
	}
</script>