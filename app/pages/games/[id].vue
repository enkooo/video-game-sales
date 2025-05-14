<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const id = route.params.id
const game = ref(null)
const loading = ref(true)
const error = ref(null)

const client = useSupabaseClient();

const fetchGameDetails = async () => {
  try {
    loading.value = true
    const { data, error: fetchError } = await client
      .from('video_games')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    game.value = data
  } catch (err) {
    console.error('Error fetching game details:', err)
    error.value = 'Failed to load game details'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchGameDetails()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
    <button 
      @click="goBack" 
      class="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Back to Games
    </button>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else-if="game" class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <!-- Header with game title and main details -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ game.name }}</h1>
            <div class="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">Rank #{{ game.rank }}</span>
              <span class="mx-2">•</span>
              <span>{{ game.year }}</span>
              <span class="mx-2">•</span>
              <span>{{ game.platform }}</span>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Publisher</div>
            <div class="text-base font-semibold text-gray-900 dark:text-white">{{ game.publisher }}</div>
          </div>
        </div>
      </div>

      <!-- Game details section -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Game information -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Game Information</h2>
            <div class="space-y-3">
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Genre</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.genre }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Platform</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.platform }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Release Year</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.year }}</span>
              </div>
              <div class="flex justify-between pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Publisher</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.publisher }}</span>
              </div>
            </div>
          </div>

          <!-- Sales information -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Information</h2>
            <div class="space-y-3">
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">North America</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.na_sales }} million</span>
              </div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Europe</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.eu_sales }} million</span>
              </div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Japan</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.jp_sales }} million</span>
              </div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Other Regions</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.other_sales }} million</span>
              </div>
              <div class="flex justify-between pb-2 font-semibold">
                <span class="text-sm text-gray-600 dark:text-gray-400">Global Sales</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ game.global_sales }} million</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales chart visualizations could be added here -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Distribution</h2>
        <!-- Add a chart here if you have a charting library -->
        <div class="h-12 grid grid-cols-4 gap-1 mt-4">
          <div 
            class="bg-blue-500 rounded" 
            :style="{ width: `${(game.na_sales / game.global_sales) * 100}%` }"
            title="North America Sales"
          ></div>
          <div 
            class="bg-green-500 rounded" 
            :style="{ width: `${(game.eu_sales / game.global_sales) * 100}%` }"
            title="Europe Sales"
          ></div>
          <div 
            class="bg-yellow-500 rounded" 
            :style="{ width: `${(game.jp_sales / game.global_sales) * 100}%` }"
            title="Japan Sales"
          ></div>
          <div 
            class="bg-purple-500 rounded" 
            :style="{ width: `${(game.other_sales / game.global_sales) * 100}%` }"
            title="Other Regions Sales"
          ></div>
        </div>
        <div class="grid grid-cols-4 gap-1 mt-2 text-xs text-center">
          <div class="text-blue-700">NA ({{ ((game.na_sales / game.global_sales) * 100).toFixed(1) }}%)</div>
          <div class="text-green-700">EU ({{ ((game.eu_sales / game.global_sales) * 100).toFixed(1) }}%)</div>
          <div class="text-yellow-700">JP ({{ ((game.jp_sales / game.global_sales) * 100).toFixed(1) }}%)</div>
          <div class="text-purple-700">Other ({{ ((game.other_sales / game.global_sales) * 100).toFixed(1) }}%)</div>
        </div>
      </div>

      <!-- Related games could be added here -->

    </div>
  </div>
</template>