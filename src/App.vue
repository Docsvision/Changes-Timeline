<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { date } from 'quasar'

const mylimit = ref(10)
const myoffset = ref(0)
const showButton = ref(false)

const empty = ref(false)
const err = ref(false)
const loading = ref(true)

// this block for local testing *************************

const apiUrl = computed(() => {
	return 'https://help.docsvision.com/api/changelog/tree?offset=0&limit=10'
})

// end local testing *************************************

// const host = window.location.protocol + '//' + window.location.hostname
// const apiUrl = computed(() => {
// 	return host + '/api/changelog/tree' + '?offset=' + myoffset.value + '&limit=' + mylimit.value
// })

const data1 = ref([])

const getData = () => {
	loading.value = true
	fetch(apiUrl.value)
		.then(async (response) => {
			const data = await response.json()

			if (!response.ok) {
				const error = (data && data.message) || response.statusText
				return Promise.reject(error)
			}
			data1.value = data

			if (data1.value.length === 0) {
				empty.value = true
			}

			loading.value = false
			showButton.value = true

			if (data.length < mylimit.value) {
				showButton.value = false
			}

			// let left = response.headers.get('X-Items-Left')
			console.log(response.headers.get('X-Items-Left'))
			console.log(response)
		})
		.catch((error) => {
			console.error('Ошибка получения данных с сервера', error)
			err.value = true
		})
}

onBeforeMount(() => getData())

const calcTitle = (id: number) => {
	switch (id) {
		case 1:
			return 'Платформа 5.5.5'
		case 2:
			return 'Windows-клиент 5.5.4'
		case 3:
			return 'Базовые объекты 5.5.5'
		case 4:
			return 'Управление документами 5.5.4'
		case 5:
			return 'Конструктор согласований 5.5.3'
		case 6:
			return 'Служба фоновых операций 5.5.2'
		case 7:
			return 'Документация Web-клиент 5.5.17'
		// case 7:
		// 	return 'Web-клиент 5.5.17'
		case 8:
			return 'Консоль управления 5.5.1'
		case 9:
			return 'Модуль интеграции с операторами ЭДО 5.5.4'
		case 10:
			return 'Конструктор согласований 6.1'
		case 11:
			return 'Базовые объекты 6.1'
		case 12:
			return 'Управление документами 6.1'
		case 13:
			return 'Консоль управления 6.1'
		case 14:
			return 'Платформа 6.1'
		case 15:
			return 'Делопроизводство 4.5'
		case 16:
			return 'Web-клиент 6.1'
		case 17:
			return 'Windows-клиент 6.1'
		case 18:
			return 'Служба фоновых операций 6.1'
		case 19:
			return 'Управление процессами 6.1'

		default:
			return 'Конструктор согласований 5.5.4'
	}
	return
}

const calcSide = (item: any) => {
	if (item.productId == 7) {
		return 'right'
	}
	return 'left'
}

const { formatDate } = date
const formattedDate = (item: any) => {
	return date.formatDate(item.metadata.publishDate, 'DD MMMM YYYY', {
		months: [
			'январь',
			'феваль',
			'март',
			'апрель',
			'май',
			'июнь',
			'июль',
			'август',
			'сенябрь',
			'октябрь',
			'ноябрь',
			'декабрь',
		],
	})
}
const chips = [
	'Документация',
	'Платформа',
	// 'Windows-клиент',
	'Web-клиент',
	'Управление документами',
	'Конструктор согласований',
	'Базовые объекты',
]
</script>

<template lang="pug">
// h4 Здесь будет timeline

template(v-if="err")
	.empty Не удалось получить данные
template(v-if="empty")
	.empty.green Изменений не было.
template(v-if="!empty && !err")
	// div Здесь поиск и фильтры
	.row.items-center
		q-chip(v-for="chip in chips" :key="chip" :label="chip")
		q-btn.q-mx-lg(round icon="mdi-dots-vertical" color="accent" dense) 
		q-form.quick
			q-input(dense
				v-model="query"
				autofocus
				clearable
				@clear="clearFilter"
				placeholder="фильтр"
				).query
				template(v-slot:prepend)
					q-icon(name="mdi-magnify")


	q-timeline(layout="loose")
		q-timeline-entry(heading) Продукты docsvision
		q-timeline-entry(v-for="item in data1" :key="item.id"
			:title="calcTitle(item.productId)"
			:subtitle="formattedDate(item)"
			:side="calcSide(item)"
			icon="mdi-check-bold" color="primary"
			)
			.q-mb-lg Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorem consequuntur explicabo excepturi consequatur iusto, libero provident eius dolores vel architecto est fugit quis rem facilis illo id repudiandae. Adipisci, ea.

	.text-center
		q-btn(v-if="showButton" label="Вперед в прошлое !" color="accent" @click="more").more
</template>

<style scoped lang="scss">
:deep(.q-timeline__heading-title) {
	font-size: 2rem;
}
</style>
