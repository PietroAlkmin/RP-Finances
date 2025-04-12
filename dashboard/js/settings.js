/**
 * Settings Manager
 * Handles user settings and preferences for the dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const settingsLink = document.getElementById('settings-link');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const saveSettings = document.getElementById('save-settings');
    const resetSettings = document.getElementById('reset-settings');

    // Settings form elements
    const themeSelect = document.getElementById('theme-select');
    const refreshInterval = document.getElementById('refresh-interval');
    const cacheDuration = document.getElementById('cache-duration');
    const showNotifications = document.getElementById('show-notifications');
    const autoRefresh = document.getElementById('auto-refresh');

    // Default settings
    const defaultSettings = {
        theme: 'light',
        refreshInterval: 300, // seconds (5 minutes to reduce API calls)
        cacheDuration: 1800, // seconds (30 minutes to reduce API calls)
        showNotifications: true,
        autoRefresh: false // Disabled by default to prevent API errors
    };

    // Load settings from localStorage
    function loadSettings() {
        let settings = localStorage.getItem('dashboardSettings');

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = defaultSettings;
            saveSettingsToStorage(settings);
        }

        // Apply settings to form
        themeSelect.value = settings.theme;
        refreshInterval.value = settings.refreshInterval;
        cacheDuration.value = settings.cacheDuration;
        showNotifications.checked = settings.showNotifications;
        autoRefresh.checked = settings.autoRefresh;

        // Apply settings to dashboard
        applySettings(settings);
    }

    // Save settings to localStorage
    function saveSettingsToStorage(settings) {
        localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    }

    // Apply settings to the dashboard
    function applySettings(settings) {
        // Apply theme
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${settings.theme}`);

        // Apply refresh interval to the realtime updater
        if (window.dashboardConfig) {
            window.dashboardConfig.refreshInterval = settings.refreshInterval * 1000;
        }

        // Apply cache duration
        if (window.cacheManager) {
            window.cacheManager.setDefaultExpiration(settings.cacheDuration * 1000);
        }

        // Apply notification settings
        if (window.dashboardConfig) {
            window.dashboardConfig.showNotifications = settings.showNotifications;
        }

        // Apply auto refresh setting
        if (window.dashboardConfig) {
            window.dashboardConfig.autoRefresh = settings.autoRefresh;

            // Update footer text
            const footerText = document.querySelector('.footer p:last-child');
            if (footerText) {
                footerText.textContent = settings.autoRefresh ?
                    'Atualização em tempo real ativada' :
                    'Atualização em tempo real desativada';
            }
        }
    }

    // Get current settings from form
    function getSettingsFromForm() {
        return {
            theme: themeSelect.value,
            refreshInterval: parseInt(refreshInterval.value),
            cacheDuration: parseInt(cacheDuration.value),
            showNotifications: showNotifications.checked,
            autoRefresh: autoRefresh.checked
        };
    }

    // Event Listeners
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            settingsModal.classList.remove('hidden');
        });
    }

    if (closeSettings) {
        closeSettings.addEventListener('click', function() {
            settingsModal.classList.add('hidden');
        });
    }

    if (saveSettings) {
        saveSettings.addEventListener('click', function() {
            const settings = getSettingsFromForm();
            saveSettingsToStorage(settings);
            applySettings(settings);
            settingsModal.classList.add('hidden');

            // Show notification
            if (window.showNotification) {
                window.showNotification('Configurações salvas com sucesso!', 'success');
            }
        });
    }

    if (resetSettings) {
        resetSettings.addEventListener('click', function() {
            // Reset form to defaults
            themeSelect.value = defaultSettings.theme;
            refreshInterval.value = defaultSettings.refreshInterval;
            cacheDuration.value = defaultSettings.cacheDuration;
            showNotifications.checked = defaultSettings.showNotifications;
            autoRefresh.checked = defaultSettings.autoRefresh;
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Initialize settings
    loadSettings();

    // Show API status notification
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('Usando dados simulados para demonstração. As APIs externas não estão disponíveis no momento.', 'info', 8000);
        }
    }, 3000);
});
