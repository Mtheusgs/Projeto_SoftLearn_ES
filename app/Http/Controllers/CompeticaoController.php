<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class CompeticaoController extends Controller
{
    /**
     * Retorna o ranking estático de exemplo.
     */
    private function getRanking(): array
    {
        return [
            ['id' => 1, 'position' => 1, 'name' => 'Ana Clara Silva', 'level' => 47, 'xp' => 15450, 'badges' => 24, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', 'email' => 'ana@example.com'],
            ['id' => 2, 'position' => 2, 'name' => 'Pedro Henrique Costa', 'level' => 45, 'xp' => 14890, 'badges' => 22, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', 'email' => 'pedro@example.com'],
            ['id' => 3, 'position' => 3, 'name' => 'Julia Martins Santos', 'level' => 43, 'xp' => 13720, 'badges' => 21, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia', 'email' => 'julia@example.com'],
            ['id' => 4, 'position' => 4, 'name' => 'Lucas Oliveira', 'level' => 41, 'xp' => 12950, 'badges' => 19, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', 'email' => 'lucas@example.com'],
            ['id' => 5, 'position' => 5, 'name' => 'Beatriz Almeida', 'level' => 40, 'xp' => 12380, 'badges' => 18, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz', 'email' => 'beatriz@example.com'],
            ['id' => 6, 'position' => 6, 'name' => 'Rafael Santos', 'level' => 39, 'xp' => 11850, 'badges' => 17, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael', 'email' => 'rafael@example.com'],
            ['id' => 7, 'position' => 7, 'name' => 'Mariana Costa', 'level' => 38, 'xp' => 11200, 'badges' => 16, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana', 'email' => 'mariana@example.com'],
            ['id' => 8, 'position' => 8, 'name' => 'Gabriel Lima', 'level' => 37, 'xp' => 10850, 'badges' => 15, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel', 'email' => 'gabriel@example.com'],
            ['id' => 9, 'position' => 9, 'name' => 'Isabela Ferreira', 'level' => 36, 'xp' => 10200, 'badges' => 14, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabela', 'email' => 'isabela@example.com'],
            ['id' => 10, 'position' => 10, 'name' => 'Thiago Silva', 'level' => 35, 'xp' => 9800, 'badges' => 13, 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thiago', 'email' => 'thiago@example.com'],
        ];
    }

    public function index()
    {
        // Dados do ranking (simulado - em produção viria do banco)
        $ranking = $this->getRanking();

        // Dados do usuário logado (simulado)
        $currentUser = Auth::user();
        $userPosition = 15; // Posição do usuário logado (simulado)
        $userLevel = 32;
        $userXP = 8500;
        $userBadges = 11;

        // Verificar se o usuário está no top 10
        $userInTop10 = false;
        foreach ($ranking as $user) {
            if (isset($user['email']) && $user['email'] === $currentUser->email) {
                $userInTop10 = true;
                // Se estiver no top 10, usamos a posição real
                $userPosition = $user['position'];
                $userLevel = $user['level'];
                $userXP = $user['xp'];
                $userBadges = $user['badges'];
                break;
            }
        }

        return view('competicao', [
            'ranking' => $ranking,
            'currentUser' => $currentUser,
            'userPosition' => $userPosition,
            'userLevel' => $userLevel,
            'userXP' => $userXP,
            'userBadges' => $userBadges,
            'userInTop10' => $userInTop10,
        ]);
    }

    public function show($id)
    {
        $ranking = $this->getRanking();

        // Perfil do próprio usuário logado
        if ($id === 'me') {
            $currentUser = Auth::user();

            $user = [
                'id' => 'me',
                'position' => 15, // mesma posição simulada da tela principal
                'name' => $currentUser->name,
                'level' => 32,
                'xp' => 8500,
                'badges' => 11,
                'avatar' => 'https://www.gravatar.com/avatar/' . md5(strtolower(trim($currentUser->email))) . '?d=mp',
                'email' => $currentUser->email,
                'streak' => 18,
                'maxXpSession' => 720,
                'diagramsCompleted' => 240,
                'accuracy' => 82,
                'avgTime' => '5min 10s',
                'evolutionRate' => '1.9 níveis/semana',
                'avgXpPerDay' => 180,
            ];

            return view('competicao-perfil', ['user' => $user]);
        }

        // Procura usuário no ranking principal
        $found = null;
        foreach ($ranking as $item) {
            if ($item['id'] == $id) {
                $found = $item;
                break;
            }
        }

        if ($found) {
            // Enriquecer com estatísticas específicas por posição
            $base = [
                1 => ['streak' => 28, 'maxXpSession' => 850, 'diagramsCompleted' => 347, 'accuracy' => 87, 'avgTime' => '4min 32s', 'evolutionRate' => '2.3 níveis/semana', 'avgXpPerDay' => 220],
                2 => ['streak' => 25, 'maxXpSession' => 820, 'diagramsCompleted' => 320, 'accuracy' => 85, 'avgTime' => '4min 45s', 'evolutionRate' => '2.1 níveis/semana', 'avgXpPerDay' => 210],
                3 => ['streak' => 22, 'maxXpSession' => 780, 'diagramsCompleted' => 298, 'accuracy' => 84, 'avgTime' => '5min 10s', 'evolutionRate' => '2.0 níveis/semana', 'avgXpPerDay' => 195],
            ];

            $extra = $base[$found['position']] ?? [
                'streak' => 18,
                'maxXpSession' => 700,
                'diagramsCompleted' => 250,
                'accuracy' => 80,
                'avgTime' => '5min 30s',
                'evolutionRate' => '1.8 níveis/semana',
                'avgXpPerDay' => 170,
            ];

            $user = array_merge($found, $extra);
        } else {
            // Fallback genérico se alguém acessar um ID inexistente
            $user = [
                'id' => $id,
                'position' => (int) $id,
                'name' => 'Usuário ' . $id,
                'level' => max(1, 40 - (int) $id),
                'xp' => max(0, 10000 - ((int) $id * 200)),
                'badges' => max(0, 15 - (int) $id),
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=User' . $id,
                'email' => 'user' . $id . '@example.com',
                'streak' => 15,
                'maxXpSession' => 600,
                'diagramsCompleted' => 200,
                'accuracy' => 75,
                'avgTime' => '6min',
                'evolutionRate' => '1.5 níveis/semana',
                'avgXpPerDay' => 150,
            ];
        }

        return view('competicao-perfil', ['user' => $user]);
    }
}

