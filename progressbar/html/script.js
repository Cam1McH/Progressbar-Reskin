document.addEventListener("DOMContentLoaded", (event) => {
    var ProgressBar = {
        init: function () {
            this.progressLabel = document.getElementById("progress-label");
            this.progressPercentage = document.getElementById("progress-percentage");
            this.progressBar = document.getElementById("progress-bar");
            this.progressContainer = document.querySelector(".progress-container");
            this.setupListeners();
        },

        setupListeners: function () {
            window.addEventListener("message", (event) => {
                if (event.data.action === "progress") {
                    this.update(event.data);
                } else if (event.data.action === "cancel") {
                    this.cancel();
                }
            });
        },

        update: function (data) {
            if (this.animationFrameRequest) {
                cancelAnimationFrame(this.animationFrameRequest);
            }
            clearTimeout(this.cancelledTimer);

            this.progressLabel.textContent = data.label;
            this.progressPercentage.textContent = "0%";
            this.progressContainer.style.display = "block";
            this.progressContainer.classList.remove("pop-out"); 
            this.progressContainer.classList.add("pop-in"); 

            let startTime = Date.now();
            let duration = parseInt(data.duration, 10);

            const animateProgress = () => {
                let timeElapsed = Date.now() - startTime;
                let progress = timeElapsed / duration;
                if (progress > 1) progress = 1;
                let percentage = Math.round(progress * 100);
                this.progressBar.style.width = percentage + "%";
                this.progressPercentage.textContent = percentage + "%";
                if (progress < 1) {
                    this.animationFrameRequest = requestAnimationFrame(animateProgress);
                } else {
                    this.onComplete();
                }
            };
            this.animationFrameRequest = requestAnimationFrame(animateProgress);
        },

        cancel: function () {
            if (this.animationFrameRequest) {
                cancelAnimationFrame(this.animationFrameRequest);
                this.animationFrameRequest = null;
            }
            this.progressLabel.textContent = "CANCELLED";
            this.progressPercentage.textContent = "";
            this.progressBar.style.width = "100%";
            this.cancelledTimer = setTimeout(this.onCancel.bind(this), 1000);

            this.progressContainer.classList.remove("pop-in"); 
            this.progressContainer.classList.add("pop-out"); 
        },

        onComplete: function () {
            this.progressContainer.classList.add("pop-out"); 
            setTimeout(() => {
                this.progressContainer.style.display = "none";
            }, 300); 
            this.progressBar.style.width = "0";
            this.progressPercentage.textContent = "";
            this.postAction("FinishAction");
        },

        onCancel: function () {
            this.progressContainer.classList.add("pop-out"); 
            setTimeout(() => {
                this.progressContainer.style.display = "none";
            }, 300); 
            this.progressBar.style.width = "0";
            this.progressPercentage.textContent = "";
        },

        postAction: function (action) {
            fetch(`https://progressbar/${action}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
        },
    };

    ProgressBar.init();
});
