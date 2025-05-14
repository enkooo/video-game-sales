<script setup lang="ts">
import { validateGameData } from '../helpers/validateGame';
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const toast = useToast()

type Game = {
  id: string
  rank: number
  name: string
  platform: string
  year: number
  genre: string
  publisher: string
  na_sales: number
  eu_sales: number
  jp_sales: number
  other_sales: number
  global_sales: number
}

const columns: TableColumn<Game>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: 'rank',
    header: 'Rank',
    cell: ({ row }) => `#${row.getValue('rank')}`
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'platform',
    header: 'Platform'
  },
  {
    accessorKey: 'year',
    header: 'Release year'
  },
  {
    accessorKey: 'genre',
    header: 'Genre'
  },
  {
    accessorKey: 'publisher',
    header: 'Publisher'
  },
  {
    accessorKey: 'global_sales',
    header: () => h('div', { class: 'text-right' }, 'Global Sales'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('global_sales'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
      return h('div', { class: 'text-right font-medium' }, `${formatted}M`)
    }
  },
  {
    id: 'action'
  }
]

function getDropdownActions(game: Game): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Details',
        icon: 'i-lucide-eye',
        onSelect: () => {
          navigateTo(`/games/${game.id}`)
        }
      }
    ],
    [
      {
        label: 'Edit',
        icon: 'i-lucide-edit',
        onSelect: () => {
            open.value = true
            editId.value = game.id
            const { id, ...gameWithoutId } = game
            gameJson.value = JSON.stringify(gameWithoutId, null, 2)
        }
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => {
          handleDelete(game.id)
        }
      }
    ]
  ]
}

const client = useSupabaseClient();
const games = ref<Game[]>([])
const totalCount = ref<number | undefined>(0);
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(false);
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
const search = ref<string>('');
const searchDebounce = ref<NodeJS.Timeout | null>(null);

const fetchGames = async (searchValue: string) => {
  try {
    loading.value = true;
    const from = (currentPage.value - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const filter = searchValue
      ? client.from('video_games').select('*', { count: 'exact', head: true }).ilike('name', `%${searchValue}%`)
      : client.from('video_games').select('*', { count: 'exact', head: true });

    const { count, error: countError } = await filter;
    
    if (countError) throw countError;
    if (count) totalCount.value = count;

    const dataQuery = searchValue
      ? client.from('video_games').select().ilike('name', `%${searchValue}%`).order('rank', { ascending: true }).range(from, to)
      : client.from('video_games').select().order('rank', { ascending: true }).range(from, to);

    const { data, error: fetchError } = await dataQuery;
    if (fetchError) throw fetchError;

    games.value = data;
  } catch (err) {
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

watch(search, (newValue) => {
  currentPage.value = 1;
  pagination.value.pageIndex = 0;
  
  if (searchDebounce.value) clearTimeout(searchDebounce.value);
  
  searchDebounce.value = setTimeout(() => {
    fetchGames(newValue);
  }, 300);
});

watch(currentPage, async () => {
  fetchGames(search.value);
});

await fetchGames(search.value);

const handleDelete = async (id: string) => {
  try {
    const { error } = await client
      .from('video_games')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchGames(search.value);

    toast.add({
      title: 'Game has been deleted',
      color: 'error',
      icon: 'i-lucide-circle-check'
    })
  } catch (err) {
    console.error('Error deleting game:', err);
  }
};

const open = ref(false);
const editId = ref<number | string>('');
const gameJson = ref<string>('');

const handleUpdateGame = async () => {
  try {
    const gameData = JSON.parse(gameJson.value);
    const { isValid, message } = validateGameData(gameData);
    
    if (isValid) {
      const { error } = await client
        .from('video_games')
        .update(gameData as never)
        .eq('id', editId.value);

      if (error) {
        throw error;
      }

      await fetchGames(search.value);

      toast.add({
        title: 'Game has been updated',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })

      open.value = false;
    } else {
      toast.add({
        title: 'Validation error',
        description: message,
        color: 'error',
        icon: 'i-lucide-alert-triangle'
      });
    }
  } catch (err) {
    console.error('Error updating game:', err);
  }
};

const handleCreateGame = async () => {
  try {
    const gameData = JSON.parse(gameJson.value);
    const { isValid, message } = validateGameData(gameData);

    if (isValid) {
      const { error } = await client
        .from('video_games')
        .insert(gameData as never);

      if (error) {
        throw error;
      }

      await fetchGames(search.value);

      toast.add({
        title: 'Game has been created',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })

      open.value = false;
    } else {
      toast.add({
      title: 'Validation error',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    });
    }
  } catch (err) {
    console.error('Error creating game:', err);
  }
};
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-xl font-bold mt-4 ml-4 mb-0">Video Game Sales</h1>
    
    <div class="flex px-4 py-3.5 border-b border-accented m-0">
      <UInput
        v-model="search"
        class="max-w-sm"
        placeholder="Search by name"
      />
      <UButton
        label="Add Game"
        color="primary"
        class="ml-auto"
        @click="() => {
          open = true
          editId = ''
          gameJson = ''
        }"
      />
    </div>

    <UTable
      v-model:pagination="pagination"
      :data="games"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      class="flex-1"
      :loading="loading"
      loading-color="primary"
      loading-animation="carousel"
    >
      <template #expanded="{ row }">
        <pre>{{ row.original }}</pre>
      </template>
      <template #action-cell="{ row }">
      <UDropdownMenu :items="getDropdownActions(row.original)">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          aria-label="Actions"
        />
      </UDropdownMenu>
    </template>
    </UTable>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :total="totalCount"
        @update:page="currentPage = $event"
      />
    </div>

    <UModal v-model:open="open">
      <template #content>
        <div class="p-4 flex flex-col gap-4">
          <UTextarea v-model="gameJson" color="neutral" variant="subtle" :rows="12" />
          <UButton
            v-if="editId"
            label="Update"
            color="primary"
            class="self-end"
            @click="handleUpdateGame"
          >
            Update
          </UButton>
          <UButton
            v-else
            label="Create"
            color="primary"
            class="self-end"
            @click="handleCreateGame"
          >
            Create
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>