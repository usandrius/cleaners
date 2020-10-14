<template>
	<li class="schedule-item list-group-item d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start"
			:class="{ disabled: item.disabled }">

		<input type="checkbox" v-model="isChecked">
		<div class="time col-2">{{ item.hours + ':' + item.minutes }}</div>

		<div v-if="item.cleanerName" class="cleaner-name col-sm-5 col-7">{{ item.cleanerName }}</div>
		<div v-else class="select-wrap col-sm-5 col-7">
			<select v-model="selectedCleaner">
				<option disabled value="">Выберите уборщика</option>
				<option v-for="cleaner in cleanersList"
								:key="cleaner.id">{{ cleaner.name }}</option>
			</select>
		</div>

		<div v-if="isVisibleButtonSave"
				 class="btn-wrap col-sm-4 col-12 mt-2 mt-sm-0 d-flex justify-content-center">
			<button @click="buttonSaveClicked"
							class="btn btn-outline-success">Сохранить</button>
		</div>

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
				newItem.isChecked = this.isChecked
				newItem.cleanerName = this.selectedCleaner
				newItem.disabled = true

				this.selectedCleaner = ''

				this.$emit('update-item', newItem)
			}
		}
	}
</script>