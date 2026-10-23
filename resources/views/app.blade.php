<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- SleepOrDie Pure Dark Theme & Tactical Special Theme Hydration --}}
        <script>
            document.documentElement.classList.add('dark');
            try {
                localStorage.setItem('appearance', 'dark');
                var serverTheme = "{{ Auth::user()?->theme_preference ?? '' }}";
                var localTheme = localStorage.getItem('sleep_theme_preference');
                var finalTheme = localTheme || serverTheme || 'dark';
                if (finalTheme === 'special') {
                    document.documentElement.classList.add('theme-special');
                    document.documentElement.setAttribute('data-theme', 'special');
                } else {
                    document.documentElement.classList.remove('theme-special');
                    document.documentElement.removeAttribute('data-theme');
                }

                var serverBorder = "{{ Auth::user()?->border_style ?? '' }}";
                var localBorder = localStorage.getItem('sleep_border_style');
                var finalBorder = localBorder || serverBorder || 'rounded';
                if (finalBorder === 'sharp') {
                    document.documentElement.classList.add('corners-sharp');
                    document.documentElement.setAttribute('data-corners', 'sharp');
                } else {
                    document.documentElement.classList.remove('corners-sharp');
                    document.documentElement.removeAttribute('data-corners');
                }
            } catch (e) {}
        </script>

        {{-- Always dark background to eliminate white flashes --}}
        <style>
            :root, html, body {
                color-scheme: dark !important;
                background-color: #09090b !important;
                color: #ffffff !important;
            }
            html.dark {
                background-color: #09090b !important;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Kanit:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
