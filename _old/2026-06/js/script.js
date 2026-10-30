// === PROFESSIONAL JAVASCRIPT ARCHITECTURE ===

$(document).ready(function() {
    // १. पेज लोड हुँदा कन्सोलमा म्यासेज पठाउने (Professional Debugging Practice)
    console.log("Kiran Paudel Portfolio Core System Launched Successfully.");

    // २. स्मूथ स्क्रोलिङ इफेक्ट (Smooth Scroll Adjustment)
    $('#menubar a, .btn a').on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function() {
                window.location.hash = hash;
            });
        }
    });
});