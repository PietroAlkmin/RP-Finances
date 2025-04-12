/**
 * Pluggy Connect Widget
 * This is a simplified mock version of the Pluggy Connect Widget for demo purposes
 */

(function() {
    // Define the PluggyConnect class
    class PluggyConnect {
        constructor(options) {
            this.options = options || {};
            this.isOpen = false;
            this.modal = null;
            
            // Validate required options
            if (!this.options.connectToken) {
                console.error('PluggyConnect: connectToken is required');
                if (this.options.onError) {
                    this.options.onError(new Error('connectToken is required'));
                }
                return;
            }
            
            console.log('PluggyConnect initialized with options:', {
                ...this.options,
                connectToken: '***' // Hide the token for security
            });
        }
        
        // Open the widget
        open() {
            if (this.isOpen) {
                console.warn('PluggyConnect: Widget is already open');
                return;
            }
            
            console.log('PluggyConnect: Opening widget');
            this.isOpen = true;
            
            // Create the modal
            this.createModal();
            
            // Show the modal
            setTimeout(() => {
                this.modal.style.opacity = '1';
            }, 50);
        }
        
        // Close the widget
        close() {
            if (!this.isOpen || !this.modal) {
                return;
            }
            
            console.log('PluggyConnect: Closing widget');
            
            // Hide the modal
            this.modal.style.opacity = '0';
            
            // Remove the modal after animation
            setTimeout(() => {
                document.body.removeChild(this.modal);
                this.modal = null;
                this.isOpen = false;
                
                // Call onClose callback
                if (this.options.onClose) {
                    this.options.onClose();
                }
            }, 300);
        }
        
        // Create the modal
        createModal() {
            // Create modal container
            this.modal = document.createElement('div');
            this.modal.style.position = 'fixed';
            this.modal.style.top = '0';
            this.modal.style.left = '0';
            this.modal.style.width = '100%';
            this.modal.style.height = '100%';
            this.modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            this.modal.style.display = 'flex';
            this.modal.style.justifyContent = 'center';
            this.modal.style.alignItems = 'center';
            this.modal.style.zIndex = '9999';
            this.modal.style.opacity = '0';
            this.modal.style.transition = 'opacity 0.3s ease';
            
            // Create modal content
            const content = document.createElement('div');
            content.style.backgroundColor = '#fff';
            content.style.borderRadius = '8px';
            content.style.padding = '20px';
            content.style.width = '500px';
            content.style.maxWidth = '90%';
            content.style.maxHeight = '90%';
            content.style.overflow = 'auto';
            content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            
            // Create header
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '20px';
            
            const title = document.createElement('h2');
            title.textContent = 'Conectar Conta Bancária';
            title.style.margin = '0';
            title.style.fontSize = '18px';
            title.style.fontWeight = '600';
            
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.fontSize = '24px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '0';
            closeButton.style.lineHeight = '1';
            closeButton.style.color = '#666';
            closeButton.addEventListener('click', () => this.close());
            
            header.appendChild(title);
            header.appendChild(closeButton);
            
            // Create bank list
            const bankList = document.createElement('div');
            bankList.style.display = 'grid';
            bankList.style.gridTemplateColumns = 'repeat(2, 1fr)';
            bankList.style.gap = '10px';
            
            // Add some mock banks
            const banks = [
                { id: 1, name: 'Banco do Brasil', logo: 'https://via.placeholder.com/40?text=BB' },
                { id: 2, name: 'Itaú', logo: 'https://via.placeholder.com/40?text=Itau' },
                { id: 3, name: 'Bradesco', logo: 'https://via.placeholder.com/40?text=Bradesco' },
                { id: 4, name: 'Santander', logo: 'https://via.placeholder.com/40?text=Santander' },
                { id: 5, name: 'Caixa', logo: 'https://via.placeholder.com/40?text=Caixa' },
                { id: 6, name: 'Nubank', logo: 'https://via.placeholder.com/40?text=Nubank' }
            ];
            
            banks.forEach(bank => {
                const bankItem = document.createElement('div');
                bankItem.style.display = 'flex';
                bankItem.style.alignItems = 'center';
                bankItem.style.padding = '10px';
                bankItem.style.border = '1px solid #eee';
                bankItem.style.borderRadius = '4px';
                bankItem.style.cursor = 'pointer';
                bankItem.style.transition = 'background-color 0.2s';
                
                bankItem.addEventListener('mouseover', () => {
                    bankItem.style.backgroundColor = '#f5f5f5';
                });
                
                bankItem.addEventListener('mouseout', () => {
                    bankItem.style.backgroundColor = '#fff';
                });
                
                bankItem.addEventListener('click', () => {
                    this.selectBank(bank);
                });
                
                const logo = document.createElement('img');
                logo.src = bank.logo;
                logo.alt = bank.name;
                logo.style.width = '40px';
                logo.style.height = '40px';
                logo.style.marginRight = '10px';
                
                const name = document.createElement('span');
                name.textContent = bank.name;
                
                bankItem.appendChild(logo);
                bankItem.appendChild(name);
                
                bankList.appendChild(bankItem);
            });
            
            // Add elements to content
            content.appendChild(header);
            content.appendChild(bankList);
            
            // Add content to modal
            this.modal.appendChild(content);
            
            // Add modal to body
            document.body.appendChild(this.modal);
            
            // Close when clicking outside
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Handle bank selection
        selectBank(bank) {
            console.log('PluggyConnect: Bank selected:', bank);
            
            // Show login form
            this.showLoginForm(bank);
        }
        
        // Show login form
        showLoginForm(bank) {
            // Clear modal content
            const content = this.modal.querySelector('div');
            content.innerHTML = '';
            
            // Create header
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '20px';
            
            const title = document.createElement('h2');
            title.textContent = `Login - ${bank.name}`;
            title.style.margin = '0';
            title.style.fontSize = '18px';
            title.style.fontWeight = '600';
            
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.fontSize = '24px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '0';
            closeButton.style.lineHeight = '1';
            closeButton.style.color = '#666';
            closeButton.addEventListener('click', () => this.close());
            
            header.appendChild(title);
            header.appendChild(closeButton);
            
            // Create form
            const form = document.createElement('form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(bank);
            });
            
            // Username field
            const usernameGroup = document.createElement('div');
            usernameGroup.style.marginBottom = '15px';
            
            const usernameLabel = document.createElement('label');
            usernameLabel.textContent = 'Usuário';
            usernameLabel.style.display = 'block';
            usernameLabel.style.marginBottom = '5px';
            usernameLabel.style.fontWeight = '500';
            
            const usernameInput = document.createElement('input');
            usernameInput.type = 'text';
            usernameInput.placeholder = 'Digite seu usuário';
            usernameInput.style.width = '100%';
            usernameInput.style.padding = '8px 12px';
            usernameInput.style.border = '1px solid #ddd';
            usernameInput.style.borderRadius = '4px';
            usernameInput.style.fontSize = '14px';
            
            usernameGroup.appendChild(usernameLabel);
            usernameGroup.appendChild(usernameInput);
            
            // Password field
            const passwordGroup = document.createElement('div');
            passwordGroup.style.marginBottom = '20px';
            
            const passwordLabel = document.createElement('label');
            passwordLabel.textContent = 'Senha';
            passwordLabel.style.display = 'block';
            passwordLabel.style.marginBottom = '5px';
            passwordLabel.style.fontWeight = '500';
            
            const passwordInput = document.createElement('input');
            passwordInput.type = 'password';
            passwordInput.placeholder = 'Digite sua senha';
            passwordInput.style.width = '100%';
            passwordInput.style.padding = '8px 12px';
            passwordInput.style.border = '1px solid #ddd';
            passwordInput.style.borderRadius = '4px';
            passwordInput.style.fontSize = '14px';
            
            passwordGroup.appendChild(passwordLabel);
            passwordGroup.appendChild(passwordInput);
            
            // Submit button
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.textContent = 'Conectar';
            submitButton.style.backgroundColor = '#3B82F6';
            submitButton.style.color = '#fff';
            submitButton.style.border = 'none';
            submitButton.style.borderRadius = '4px';
            submitButton.style.padding = '10px 16px';
            submitButton.style.fontSize = '14px';
            submitButton.style.fontWeight = '500';
            submitButton.style.cursor = 'pointer';
            submitButton.style.width = '100%';
            
            // Add elements to form
            form.appendChild(usernameGroup);
            form.appendChild(passwordGroup);
            form.appendChild(submitButton);
            
            // Add elements to content
            content.appendChild(header);
            content.appendChild(form);
        }
        
        // Handle login
        handleLogin(bank) {
            console.log('PluggyConnect: Login submitted for bank:', bank);
            
            // Show loading
            this.showLoading('Conectando...');
            
            // Simulate API call
            setTimeout(() => {
                // Create a mock item
                const mockItem = {
                    id: 'mock-' + Date.now().toString(36),
                    connector: {
                        id: bank.id,
                        name: bank.name,
                        primaryColor: '#3B82F6',
                        institutionUrl: '#',
                        country: 'BR',
                        type: 'PERSONAL_BANK'
                    },
                    status: 'UPDATED',
                    executionStatus: 'SUCCESS',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Close the widget
                this.close();
                
                // Call onSuccess callback
                if (this.options.onSuccess) {
                    this.options.onSuccess({
                        item: mockItem
                    });
                }
            }, 2000);
        }
        
        // Show loading
        showLoading(message) {
            // Clear modal content
            const content = this.modal.querySelector('div');
            content.innerHTML = '';
            
            // Create loading container
            const loadingContainer = document.createElement('div');
            loadingContainer.style.display = 'flex';
            loadingContainer.style.flexDirection = 'column';
            loadingContainer.style.alignItems = 'center';
            loadingContainer.style.justifyContent = 'center';
            loadingContainer.style.padding = '40px 20px';
            
            // Create spinner
            const spinner = document.createElement('div');
            spinner.style.border = '4px solid #f3f3f3';
            spinner.style.borderTop = '4px solid #3B82F6';
            spinner.style.borderRadius = '50%';
            spinner.style.width = '40px';
            spinner.style.height = '40px';
            spinner.style.animation = 'pluggy-spin 1s linear infinite';
            
            // Create animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pluggy-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            // Create message
            const messageElement = document.createElement('p');
            messageElement.textContent = message || 'Carregando...';
            messageElement.style.marginTop = '20px';
            messageElement.style.fontSize = '16px';
            messageElement.style.color = '#333';
            
            // Add elements to container
            loadingContainer.appendChild(spinner);
            loadingContainer.appendChild(messageElement);
            
            // Add container to content
            content.appendChild(loadingContainer);
        }
    }
    
    // Expose to window
    window.PluggyConnect = PluggyConnect;
})();
