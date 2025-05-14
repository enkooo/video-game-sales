<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { ref, onMounted } from 'vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const client = useSupabaseClient();
const route = useRoute()
const id = route.params.id
const gameData = ref(null)

const fetchGameDetails = async () => {
  try {
    const { data, error: fetchError } = await client
      .from('video_games')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    gameData.value = data
  } catch (err) {
    console.error('Error fetching game details:', err)
    error.value = 'Failed to load game details'
  } 
}

await fetchGameDetails()
const chartData = ref(null)
const chartOptions = ref({})

onMounted(() => {
  chartData.value = {
    labels: ["North America", "Europe", "Japan", "Other Regions"],
    datasets: [
      {
        label: "Sales (millions)",
        data: [gameData.value.na_sales, gameData.value.eu_sales, gameData.value.jp_sales, gameData.value.other_sales],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  chartOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: '#FFFFFF'
        }
      },
      title: {
        display: true,
        text: "Regional Sales Distribution",
        font: {
          size: 16,
        },
        color: '#FFFFFF'
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} million`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Sales (millions)",
          font: {
            size: 14,
          },
          color: '#FFFFFF'
        },
        ticks: {
          precision: 2,
          color: '#FFFFFF'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: "Region",
          font: {
            size: 14,
          },
          color: '#FFFFFF'
        },
        ticks: {
          color: '#FFFFFF'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
    },
  }
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <ULink
        to="/"
        icon="i-lucide-arrow-left"
        as="button"
        class="mb-4"
      >
        Back to Games List
      </ULink>
      <div class="mt-4 mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ gameData.name }}</h1>
        <div class="flex flex-wrap gap-2 mb-4">
          <UBadge variant="outline">{{ gameData.platform }}</UBadge>
          <UBadge variant="outline">{{ gameData.year }}</UBadge>
          <UBadge variant="outline">{{ gameData.genre }}</UBadge>
        </div>
        <p class="text-gray-400">
          Published by <span class="font-medium">{{ gameData.publisher }}</span>
        </p>
      </div>

      <div class="grid gap-6">
        <UCard>
          <div>
            <h1 class="text-xl">Regional Sales Breakdown</h1>
            <p class="text-gray-400">Sales figures in millions of units across different regions</p>
          </div>
          <div class="flex flex-col items-center justify-center">
            <div class="h-[400px] w-full">
              <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="mb-4">
            <h2 class="text-xl">Game Information</h2>
            <p class="text-gray-400">Additional details about the game</p>
          </div>
          <div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-400">Rank</h3>
                <p class="font-medium">#{{ gameData.rank }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-400">Platform</h3>
                <p class="font-medium">{{ gameData.platform }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-400">Release Year</h3>
                <p class="font-medium">{{ gameData.year }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-400">Genre</h3>
                <p class="font-medium">{{ gameData.genre }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-400">Publisher</h3>
                <p class="font-medium">{{ gameData.publisher }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-400">Global sales</h3>
                <p class="font-medium">{{ gameData.global_sales }}M</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>