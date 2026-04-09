import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/phase/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/phase/"!</div>
}
