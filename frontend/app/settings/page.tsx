'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { usersApi, type User } from '@/lib/api'
import { User as UserIcon, Shield, Palette, Info, Users } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [teamUsers, setTeamUsers] = useState<User[]>([])
  const [loadingTeam, setLoadingTeam] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoadingTeam(true)
      usersApi.getAll({ limit: 50 })
        .then((r) => setTeamUsers(r.data))
        .catch(console.error)
        .finally(() => setLoadingTeam(false))
    }
  }, [user])

  return (
    <DashboardLayout title="Configuración">
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground text-sm">Preferencias de tu cuenta y del sistema.</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <UserIcon className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Perfil</CardTitle>
              <CardDescription className="text-xs">Información de tu cuenta</CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nombre</span>
              <span className="text-sm font-medium">{user?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID de usuario</span>
              <code className="text-xs bg-muted px-2 py-0.5 rounded">{user?.id ?? '—'}</code>
            </div>
          </CardContent>
        </Card>

        {/* Role */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Shield className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Rol &amp; Permisos</CardTitle>
              <CardDescription className="text-xs">Nivel de acceso en el sistema</CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rol actual</span>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                {user?.role ?? '—'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Permisos de administrador</span>
              <span className="text-sm">{user?.role === 'admin' ? '✅ Sí' : '❌ No'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Palette className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Apariencia</CardTitle>
              <CardDescription className="text-xs">Cambiá el tema del dashboard</CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* App info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Info className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Acerca del sistema</CardTitle>
              <CardDescription className="text-xs">Información de la aplicación</CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nombre</span>
              <span className="text-sm font-medium">Interaktive Admin Dashboard</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Versión</span>
              <code className="text-xs bg-muted px-2 py-0.5 rounded">1.0.0</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stack</span>
              <span className="text-sm text-muted-foreground">Next.js 16 · Node.js · SQLite</span>
            </div>
          </CardContent>
        </Card>
        {/* Team — admin only */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Users className="size-4 text-muted-foreground" />
              <div>
                <CardTitle className="text-sm">Equipo</CardTitle>
                <CardDescription className="text-xs">Cuentas registradas en el sistema</CardDescription>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-3">
              {loadingTeam
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)
                : teamUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize text-xs">
                      {u.role}
                    </Badge>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
