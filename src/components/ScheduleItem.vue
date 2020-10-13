<template>
	<li class="schedule-item" :class="{ disabled: item.disabled }">
		
		<input type="checkbox" v-model="isChecked">
		<span class="time">{{ item.hours + ':' + item.minutes }}</span>
		<span v-if="item.cleanerName" class="cleaner-name">{{ item.cleanerName }}</span>
		<select v-else v-model="selectedCleaner">
			<option disabled value="">Выберите уборщика</option>
			<option v-for="cleaner in cleanersList"
							:key="cleaner.id">{{ cleaner.name }}</option>
		</select>
		<button v-if="isVisibleButtonSave" @click="buttonSaveClicked">Сохранить</button>

	</li>
</template>

<script>
	export default {
		props: ['item'],

		data () {
			return {
				isChecked: this.item.isChecked,	// отметка о проведении уборки
				selectedCleaner: '',						// имя уборщика, кто проводил уборку
				cleanersList: []								// список всех доступных уборщиков
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

		computed: {

			/**
			 * Проверка возможности отображения кнопки "Сохранить"(только после выбора уборщика и отметки о проведении уборки)
			 * @return {Boolean}
			 */
			isVisibleButtonSave () {
				if (this.selectedCleaner && this.isChecked) {
					return true
				}

				return false
			}
		},

		methods: {

			/**
			 * Обработка нажатия на кнопку "Сохранить"
			 */
			buttonSaveClicked () {
				let newItem = this.item
				newItem.checked = this.isChecked
				newItem.cleanerName = this.selectedCleaner

				this.selectedCleaner = ''

				this.$emit('updateItem', newItem)
			}
		}
	}
</script>