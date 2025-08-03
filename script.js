class SpinWheel {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.participants = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.lastWinner = null;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D5A6BD'
        ];
        
        this.initializeEventListeners();
        this.drawEmptyWheel();
    }
    
    initializeEventListeners() {
        // Add participant
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.addParticipant();
        });
        
        // Enter key for input
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addParticipant();
            }
        });
        
        // Spin button
        document.getElementById('spinBtn').addEventListener('click', () => {
            this.spin();
        });
        
        // Canvas click to spin
        this.canvas.addEventListener('click', () => {
            if (!this.isSpinning && this.participants.length > 1) {
                this.spin();
            }
        });
        
        // Modal event listeners
        document.getElementById('removeYesBtn').addEventListener('click', () => {
            this.removeSelectedParticipant();
        });
        
        document.getElementById('removeNoBtn').addEventListener('click', () => {
            this.closeModal('removeModal');
        });
        
        document.getElementById('respinBtn').addEventListener('click', () => {
            this.closeModal('respinModal');
            setTimeout(() => this.spin(), 300);
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startNewGame();
        });
    }
    
    addParticipant() {
        const input = document.getElementById('userInput');
        const inputText = input.value.trim();
        
        if (inputText === '') {
            alert('Please enter participant names!');
            return;
        }
        
        // Split by comma and clean up names
        const names = inputText.split(',')
            .map(name => name.trim())
            .filter(name => name !== '');
        
        if (names.length === 0) {
            alert('Please enter valid participant names!');
            return;
        }
        
        let addedCount = 0;
        let duplicateNames = [];
        let existingNames = this.participants.map(p => p.name.toLowerCase());
        
        names.forEach(name => {
            // Check for duplicates in existing participants
            if (existingNames.includes(name.toLowerCase())) {
                duplicateNames.push(name);
                return;
            }
            
            // Check for duplicates within the current input
            if (names.filter(n => n.toLowerCase() === name.toLowerCase()).length > 1) {
                // Only add the first occurrence
                if (!existingNames.includes(name.toLowerCase())) {
                    existingNames.push(name.toLowerCase());
                } else {
                    return;
                }
            }
            
            const participant = {
                name: name,
                color: this.colors[this.participants.length % this.colors.length],
                id: Date.now() + Math.random() // Ensure unique IDs
            };
            
            this.participants.push(participant);
            addedCount++;
        });
        
        // Clear input
        input.value = '';
        
        // Show feedback to user
        if (duplicateNames.length > 0) {
            alert(`Added ${addedCount} participants. Skipped duplicates: ${duplicateNames.join(', ')}`);
        } else if (addedCount > 0) {
            // Show success message for multiple additions
            if (addedCount > 1) {
                this.showSuccessMessage(`Successfully added ${addedCount} participants!`);
            }
        }
        
        this.updateParticipantsList();
        this.drawWheel();
        this.updateSpinButton();
    }
    
    removeParticipant(id) {
        this.participants = this.participants.filter(p => p.id !== id);
        this.updateParticipantsList();
        this.drawWheel();
        this.updateSpinButton();
    }
    
    updateParticipantsList() {
        const list = document.getElementById('participantsList');
        
        if (this.participants.length === 0) {
            list.innerHTML = '<p style="color: #999; font-style: italic;">No participants added yet</p>';
            return;
        }
        
        list.innerHTML = this.participants.map(participant => `
            <div class="participant-tag" style="background: ${participant.color}">
                <span>${participant.name}</span>
                <button class="remove-btn" onclick="wheel.removeParticipant(${participant.id})">×</button>
            </div>
        `).join('');
    }
    
    updateSpinButton() {
        const spinBtn = document.getElementById('spinBtn');
        const canSpin = this.participants.length > 1 && !this.isSpinning;
        
        spinBtn.disabled = !canSpin;
        
        if (this.participants.length === 0) {
            spinBtn.textContent = 'ADD PARTICIPANTS';
        } else if (this.participants.length === 1) {
            spinBtn.textContent = 'NEED MORE PARTICIPANTS';
        } else {
            spinBtn.textContent = 'SPIN';
        }
    }
    
    showSuccessMessage(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }
    
    drawEmptyWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw empty wheel
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Add text
        this.ctx.fillStyle = '#999';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Add participants to start', centerX, centerY);
    }
    
    drawWheel() {
        if (this.participants.length === 0) {
            this.drawEmptyWheel();
            return;
        }
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        const sliceAngle = (2 * Math.PI) / this.participants.length;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw segments
        this.participants.forEach((participant, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = participant.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Draw text
            const textAngle = startAngle + sliceAngle / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
            
            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(participant.name, 0, 0);
            this.ctx.restore();
        });
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
    }
    
    spin() {
        if (this.isSpinning || this.participants.length < 2) return;
        
        this.isSpinning = true;
        this.updateSpinButton();
        
        // Random rotation between 1440 and 2160 degrees (4-6 full rotations)
        const minRotation = 1440;
        const maxRotation = 2160;
        const spinRotation = Math.random() * (maxRotation - minRotation) + minRotation;
        
        const finalRotation = this.currentRotation + spinRotation;
        
        // Animate the spin
        this.animateRotation(finalRotation, () => {
            const winner = this.getWinner(finalRotation);
            this.handleWinnerSelection(winner);
        });
    }
    
    animateRotation(targetRotation, callback) {
        const startRotation = this.currentRotation;
        const duration = 4000; // 4 seconds
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for natural deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
            
            // Apply rotation to canvas
            this.canvas.style.transform = `rotate(${this.currentRotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentRotation = targetRotation % 360;
                this.isSpinning = false;
                this.updateSpinButton();
                callback();
            }
        };
        
        animate();
    }
    
    getWinner(rotation) {
        const normalizedRotation = (360 - (rotation % 360)) % 360;
        const sliceAngle = 360 / this.participants.length;
        const winnerIndex = Math.floor(normalizedRotation / sliceAngle);
        return this.participants[winnerIndex];
    }
    
    handleWinnerSelection(winner) {
        // Check if same person as last time
        if (this.lastWinner && this.lastWinner.id === winner.id && this.participants.length > 1) {
            this.showRespinModal(winner);
            return;
        }
        
        this.lastWinner = winner;
        
        // Check if this is the last participant
        if (this.participants.length === 1) {
            this.showWinnerModal(winner);
        } else {
            this.showRemovalModal(winner);
        }
    }
    
    showRemovalModal(winner) {
        document.getElementById('selectedParticipant').textContent = `🎯 ${winner.name}`;
        this.showModal('removeModal');
        this.selectedWinner = winner;
    }
    
    showRespinModal(winner) {
        document.getElementById('respinParticipant').textContent = `🎯 ${winner.name}`;
        this.showModal('respinModal');
    }
    
    showWinnerModal(winner) {
        document.getElementById('winnerName').textContent = `🎉 ${winner.name} 🎉`;
        this.showModal('winnerModal');
    }
    
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    removeSelectedParticipant() {
        if (this.selectedWinner) {
            this.removeParticipant(this.selectedWinner.id);
            this.selectedWinner = null;
            
            // Check if only one participant left
            if (this.participants.length === 1) {
                setTimeout(() => {
                    this.showWinnerModal(this.participants[0]);
                }, 500);
            }
        }
        this.closeModal('removeModal');
    }
    
    startNewGame() {
        this.participants = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.lastWinner = null;
        this.selectedWinner = null;
        
        this.canvas.style.transform = 'rotate(0deg)';
        this.updateParticipantsList();
        this.drawEmptyWheel();
        this.updateSpinButton();
        this.closeModal('winnerModal');
        
        document.getElementById('winnerDisplay').textContent = '';
    }
}

// Initialize the wheel when page loads
let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new SpinWheel();
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
