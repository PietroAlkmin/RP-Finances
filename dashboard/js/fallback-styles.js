/**
 * Fallback styles for Open Finance section
 * This script adds inline styles in case the external CSS files fail to load
 */
(function() {
    // Check if the document is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addFallbackStyles);
    } else {
        addFallbackStyles();
    }

    function addFallbackStyles() {
        console.log('Adding fallback styles for Open Finance section');

        // Create a style element
        const style = document.createElement('style');
        style.id = 'fallback-open-finance-styles';

        // Add the CSS rules
        style.textContent = `
            /* Open Finance Section Fallback Styles */
            .open-finance-section {
                margin-bottom: 30px;
            }

            .open-finance-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .open-finance-header h2 {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .open-finance-header h2 i {
                color: #4a6cf7;
            }

            .connected-accounts {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }

            .account-card {
                background-color: #fff;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                width: calc(33.333% - 10px);
                min-width: 250px;
                position: relative;
                transition: transform 0.2s, box-shadow 0.2s;
                border-left: 4px solid #4a6cf7;
                margin-bottom: 15px;
            }

            .account-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            .account-card.credit-card {
                border-left-color: #e74c3c;
            }

            .account-card.checking {
                border-left-color: #3498db;
            }

            .account-card.savings {
                border-left-color: #2ecc71;
            }

            .account-card.investment {
                border-left-color: #f39c12;
            }

            .account-card .account-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }

            .account-card .account-type {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                font-weight: 600;
                color: #333;
                font-size: 1.1em;
            }

            .account-card .account-balance {
                font-size: 1.6em;
                font-weight: 700;
                margin-bottom: 5px;
                color: #333;
            }

            .empty-accounts {
                background-color: #f9f9f9;
                border-radius: 12px;
                padding: 40px 30px;
                text-align: center;
                width: 100%;
                border: 1px dashed #ddd;
            }

            .empty-accounts i {
                font-size: 2.5em;
                color: #ccc;
                margin-bottom: 15px;
            }

            .empty-accounts p {
                color: #666;
                margin-bottom: 20px;
                font-size: 1.1em;
            }

            .connect-bank-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 10px 18px;
                background-color: #4a6cf7;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 2px 5px rgba(74, 108, 247, 0.3);
            }

            .connect-bank-btn:hover {
                background-color: #3a5ce5;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(74, 108, 247, 0.4);
            }

            .hidden {
                display: none !important;
            }

            .loading-accounts {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
                width: 100%;
                background-color: #f9f9f9;
                border-radius: 12px;
                border: 1px dashed #ddd;
            }

            .loading-accounts .spinner-border {
                width: 3rem;
                height: 3rem;
                margin-bottom: 15px;
                color: #4a6cf7;
            }

            .loading-accounts p {
                color: #666;
                font-size: 1.1em;
            }

            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
                width: 100%;
                background-color: #f9f9f9;
                border-radius: 12px;
                border: 1px dashed #ddd;
            }

            .empty-state .empty-content {
                max-width: 500px;
            }

            .empty-state .empty-icon {
                font-size: 2.5em;
                color: #e74c3c;
                margin-bottom: 15px;
            }

            .empty-state p {
                color: #666;
                margin-bottom: 5px;
                font-size: 1.1em;
            }

            .empty-state .empty-description {
                margin-bottom: 20px;
                color: #888;
            }
        `;

        // Add the style element to the head
        document.head.appendChild(style);
    }
})();
