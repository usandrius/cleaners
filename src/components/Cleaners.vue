<template>
	<div class="cleaners-wrapper">
		
		<div class="add-block-wrapper">
			<input type="text" v-model="newName">
			<button @click="addCleaner">Добавить</button>
		</div>

		<ul v-if="cleanersList.length" class="cleaners-list">
			<li v-for="cleaner in cleanersList" :key="cleaner.id">
				<span>{{ cleaner.name }}</span>
				<button @click="removeCleaner(cleaner.id)">Удалить</button>
			</li>
		</ul>

	</div>
</template>

<script>
	export default {
		data () {
			return {
				newName: '',			// имя нового уборщика
				cleanersList: []	// список уборщиков
			}
		},

		created () {
			
			/**
			 * Получаем список уборщиков из localStorage
			 */
			if (localStorage.getItem('cleanersList')) {
				try {
					this.cleanersList =  JSON.parse(localStorage.getItem('cleanersList'))
				} catch (e) {
					localStorage.removeItem('cleanersList')
				}
			}
		},

		methods: {
			
			/**
			 * Получить ID для нового уборщика
			 * 
			 * @return {Number} nextId  ID нового уборщика 	
			 */
			getNextId () {
				let nextId

				if (localStorage.getItem('nextCleanerId')) {
					nextId = localStorage.getItem('nextCleanerId')
				} else {
					nextId = 0
				}

				localStorage.setItem('nextCleanerId', ++nextId)

				return nextId
			},

			/**
			 * Сохранить список уборщиков в localStorage
			 */
			saveCleanersListToLocalStorage () {
				localStorage.setItem('cleanersList', JSON.stringify(this.cleanersList))
			},

			/**
			 * Добавить нового уборщика в список
			 */
			addCleaner () {
				if (!this.newName)
					return

				let newCleaner = {
					id: this.getNextId(),
					name: this.newName
				}

				this.cleanersList.push(newCleaner)
				this.saveCleanersListToLocalStorage()
				this.newName = ''
			},

			/**
			 * Удалить уборщика из списка
			 * @param  {Number} cleanerId 	ID удаляемого уборщика
			 */
			removeCleaner (cleanerId) {
				if (!this.cleanersList)
					return

				this.cleanersList = this.cleanersList.filter(cleaner => cleaner.id != cleanerId)
				this.saveCleanersListToLocalStorage()
			}
		}
	}
</script>