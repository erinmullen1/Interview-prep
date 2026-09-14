import { lazy } from 'react'

import { meta as debouncedSearch } from './debounced-search/meta'
import { meta as infiniteScroll } from './infinite-scroll/meta'
import { meta as optimisticTodo } from './optimistic-todo/meta'
import { meta as formValidation } from './form-validation/meta'
import { meta as dataTable } from './data-table/meta'
import { meta as accessibleModal } from './accessible-modal/meta'
import { meta as shoppingCart } from './shopping-cart/meta'
import { meta as tabsAccordion } from './tabs-accordion/meta'
import { meta as pagination } from './pagination/meta'
import { meta as dragDropList } from './drag-drop-list/meta'

export interface ChallengeMeta {
  id: string
  title: string
  category: string
  description: string
}

export interface Challenge extends ChallengeMeta {
  Demo: React.LazyExoticComponent<React.ComponentType>
  Notes: React.LazyExoticComponent<React.ComponentType>
}

function build(
  meta: ChallengeMeta,
  loadDemo: () => Promise<{ default: React.ComponentType }>,
  loadNotes: () => Promise<{ default: React.ComponentType }>,
): Challenge {
  return { ...meta, Demo: lazy(loadDemo), Notes: lazy(loadNotes) }
}

export const challenges: Challenge[] = [
  build(
    debouncedSearch,
    () => import('./debounced-search/Demo'),
    () => import('./debounced-search/notes.mdx'),
  ),
  build(
    infiniteScroll,
    () => import('./infinite-scroll/Demo'),
    () => import('./infinite-scroll/notes.mdx'),
  ),
  build(
    optimisticTodo,
    () => import('./optimistic-todo/Demo'),
    () => import('./optimistic-todo/notes.mdx'),
  ),
  build(
    formValidation,
    () => import('./form-validation/Demo'),
    () => import('./form-validation/notes.mdx'),
  ),
  build(
    dataTable,
    () => import('./data-table/Demo'),
    () => import('./data-table/notes.mdx'),
  ),
  build(
    accessibleModal,
    () => import('./accessible-modal/Demo'),
    () => import('./accessible-modal/notes.mdx'),
  ),
  build(
    shoppingCart,
    () => import('./shopping-cart/Demo'),
    () => import('./shopping-cart/notes.mdx'),
  ),
  build(
    tabsAccordion,
    () => import('./tabs-accordion/Demo'),
    () => import('./tabs-accordion/notes.mdx'),
  ),
  build(
    pagination,
    () => import('./pagination/Demo'),
    () => import('./pagination/notes.mdx'),
  ),
  build(
    dragDropList,
    () => import('./drag-drop-list/Demo'),
    () => import('./drag-drop-list/notes.mdx'),
  ),
]

export const categories = Array.from(new Set(challenges.map((c) => c.category)))

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id)
}
