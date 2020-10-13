<template>
	<div class="schedule-wrapper">
		
		<ul class="schedule">
			<app-item v-for="item in scheduleList"
								:key="item.id"
								:item="item"
								@updateItem="updateItem($event)"></app-item>
		</ul>

	</div>
</template>

<script>
	import ScheduleItem from './ScheduleItem.vue'

	export default {
		data () {
			return {
				scheduleList: []		// список элементов графика уборки
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

			this.updateScheduleList()

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
			 * Обновление списка элементов графика уборки
			 */
			updateScheduleList () {
				let timeNow = new Date(),				// время в данный момент
						minTime = new Date(),				// время начала рабочего дня
						maxTime = new Date(),				// время окончания рабочего дня
						startItemTime = new Date()	// время, с которого нужно обновить график

				minTime.setHours(8, 0, 0)
				maxTime.setHours(17, 0, 0)

				if (!this.scheduleList.length) {	
					startItemTime = minTime	// если график еще не создан, заполняем его с начала рабочего дня

				} else {

					if (timeNow < minTime) {
						this.scheduleList = []	// если время меньше времени начала рабочего дня, сбрасываем график к дефолтному состоянию
						startItemTime = minTime

					} else if (timeNow >= minTime && timeNow <= maxTime) {
						// если время в данный момент попадает в рабочий день, находим время последней уборки в графике
						let lastItem = this.scheduleList[this.scheduleList.length - 1],
								lastItemTime = new Date()

						lastItemTime.setHours(lastItem.hours, lastItem.minutes, 0)

						// если время последней уборки больше, чем время в данный момент, то сбрасываем график до настоящего времени
						if (lastItemTime > timeNow) {
							this.scheduleList = this.scheduleList.filter( item => {
								let itemTime = new Date()
								itemTime.setHours(item.hours, item.minutes, 0)

								return itemTime < timeNow
							})

							startItemTime = timeNow

						} else {
							startItemTime = lastItemTime	// иначе дополняем с времени последней уборки
						}

					} else {
						// если время больше, чем время конца рабочего дня, дополняем со времени последней уборки
						let lastItem = this.scheduleList[this.scheduleList.length - 1]
						startItemTime.setHours(lastItem.hours, lastItem.minutes, 0)
					}
				}

				let newItemHours = startItemTime.getHours(),
						newItemMinutes = startItemTime.getMinutes()
				while (!(newItemMinutes % 15 == 0)) {
					// находим следующую четверть часа
					newItemMinutes++

					if (newItemMinutes == 60) {
						newItemHours++
						newItemMinutes = 0
					}
				}

				while (newItemHours != 17) {
					// дополняем список элементов графика уборки до конца рабочего дня
					newItemMinutes = Number(newItemMinutes) + 15
					if (newItemMinutes == 60) {
						newItemHours++
						newItemMinutes = 0
					}

					let disabled = true,
							newItemTime = new Date()
					newItemTime.setHours(newItemHours, newItemMinutes, 0)

					// все элементы до настоящего времени дложны быть активны
					if (newItemTime < timeNow)
						disabled = false

					if (newItemMinutes == 0)
						newItemMinutes = '00'

					let newItem = {
						id: this.getNextId(),
						disabled: disabled,
						isChecked: false,
						hours: newItemHours,
						minutes: newItemMinutes,
						cleanerName: ''
					}

					this.scheduleList.push(newItem)
				}

				this.saveScheduleListToLocalStorage() // обновляем список в localStorage
			},

			/**
			 * Обновить список элементов графика уборки в localStorage
			 */
			saveScheduleListToLocalStorage () {
				localStorage.setItem('scheduleList', JSON.stringify(this.scheduleList))
			},

			/**
			 * Проверить время на достижение следующего времени уборки
			 */
			checkTime () {
				let timeNow = new Date(),							// время в данный момент
						hoursNow = timeNow.getHours(),		// часы в данный момент
						minutesNow = timeNow.getMinutes()	// минуты в данный момент


				if (hoursNow >= 8 && hoursNow <= 17 && minutesNow % 15 == 0) {
					// выбираем элемент с временем уборки, которое достигли в данный момент 
					let newItem = this.scheduleList.filter( item => item.hours == hoursNow && item.minutes == minutesNow)[0]
					newItem.disabled = false	// включаем для редактирования

					this.scheduleList = this.scheduleList.filter( item => item.id != newItem.id)
					this.scheduleList.push(newItem) // кладем обратно в массив данный элемент
					this.scheduleList.sort( (item1, item2) => {	// сортируем массив по времени уборки
						let time1 = new Date(),
								time2 = new Date()
						time1.setHours(item1.hours, item1.minutes, 0)
						time2.setHours(item2.hours, item2.minutes, 0)

						return time1 - time2
					})

				} else if (hoursNow < 8) {
					// если время в промежутке от 00:00 до 08:00, то сбрасываем график к дефолту
					this.scheduleList.forEach( item => {
						item.disabled = true
						item.isChecked = false
						item.cleanerName = ''
					})
				}

				this.saveScheduleListToLocalStorage() // обновляем список в localStorage

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
					this.checkTime()
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