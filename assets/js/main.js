(function(){
    ///DECLARATIONS///
    const pages = document.getElementsByClassName("pageObject");
    const navButtons = [];
    var currentPage;
    const lastPage = pages.length -1;
    var direction;
    var inTransition;
    const scrollSpeed = 25;
    var inSecondLayout;
    const secondLayoutQuery = "(min-width: 45em)";

    //START//
    CreateNavObject();
    SyncPage();

    //EVENTS//
    //Wheel - Get direction from the mouse wheel
    window.addEventListener("wheel", (e)=>{
        if (!CanAcceptReuest(e))
            return;
        direction = GetWheelDirection(e);
        SetPageFromDirection(direction);
    }, false);

    //KeyDown - Get direction from the up and down keys
    window.addEventListener("keydown", (e)=>{
        if (e.keyCode === 38 || e.keyCode === 40){        
            if (!CanAcceptReuest(e))
                return;
            direction = (e.keyCode === 38)?-1:1;
            SetPageFromDirection(direction);
        }
    }, false);

    //Resize - If in the second layout and not transitioning
    //ensure the viewport stays within the bounds of the current page
    window.addEventListener("resize", ()=>{
        if (!inTransition && inSecondLayout){
            ClampDestination(currentPage);
        }
    }, false);
    
    ///MEDIA QUERY///
    document.addEventListener("DOMContentLoaded", (e)=>{
        var secondLayoutMatcher = window.matchMedia(secondLayoutQuery);
        secondLayoutTester();
        secondLayoutMatcher.addListener(secondLayoutTester);

        function secondLayoutTester(){
            if (secondLayoutMatcher.matches){
                inSecondLayout = true;
                SyncPage(); //When entering the second layout, clamp to the nearest page
            }
            else {
                inSecondLayout = false;
            }
        }
    }, false);

    ///FUNCTIONS///
    function SetPageFromDirection(direction){
        //We need a hack here to stop Firefox "glitching" when scrolling upwards after resizing
        //after scrolling little past the first page
        if (currentPage == 0 && direction == -1){
            ClampDestination(0);
            return;
        }

        if (direction === 0 || direction === 1 && window.pageYOffset === pages[lastPage].offsetTop)
            return;

        //Get new page
        let newPage = (direction == -1)?currentPage-1:currentPage+1;
        ReuestPageTransition(newPage);
    }

    //The "main" function - scrolls from one page to another one
    function ReuestPageTransition(newPage){
        if (newPage === currentPage)
            return;

        //Get Direction
        direction = (newPage < currentPage)?-1:1;

        //Sync
        currentPage = newPage;
        SyncNavButtons();

        //AnimationRequest
        var animationfuncWrapper;

        var animationfunc = function(){
            let destination = pages[currentPage].offsetTop;
            if (window.pageYOffset === destination){
                inTransition = false;
                cancelAnimationFrame(animationfuncWrapper);
                return;
            }

            //Scroll Up
            if (direction === -1){
                if (window.pageYOffset > destination){
                    window.scrollBy(0, -scrollSpeed);
                }
                if (window.pageYOffset <= destination){
                    ClampDestination(currentPage);
                }
            }
            
            //Scroll Down
            if (direction === 1){
                if (window.pageYOffset < destination){
                    window.scrollBy(0, scrollSpeed);
                }
                if (window.pageYOffset >= destination){
                    ClampDestination(currentPage);
                }
            }

            //Update the animation
            animationfuncWrapper = requestAnimationFrame(animationfunc);
        }

        //Finish
        animationfuncWrapper = requestAnimationFrame(animationfunc);
        inTransition = true;
    }

    function SyncPage(){
        for (let x = 0; x < pages.length; x++){
            if (x != lastPage){
                if (window.pageYOffset >= pages[x].offsetTop && window.pageYOffset < pages[x+1].offsetTop){
                    currentPage = x;
                    break;
                }
            }
            else {
                currentPage = x;
                break;
            }
        }
        ClampDestination(currentPage);
        SyncNavButtons();
    }

    function ClampDestination(index){
        window.scrollTo(0, pages[index].offsetTop);
    }
    
    ///HELPER FUNCTIONS///
    function CanAcceptReuest(e){
        if(!inSecondLayout)
            return false;
        e.preventDefault(); //Stop scrolling
        if (inTransition)
            return false;
        return true;
    }

    function GetWheelDirection(e){
        let _delta = (e.wheelDelta)?e.wheelDelta:-1 * e.deltaY;
        if (_delta < 0){
            return 1; //Downwards
        }
        if (_delta > 0){
            return -1; //Upwards
        }
        return 0; //No movement
    }

    ///NAVIGATION FUNCTIONS///
    function CreateNavObject(){
        let navOb = document.createElement("nav");
        navOb.id = "mainNav";
        document.getElementById("siteWrapper").appendChild(navOb);

        for (let x = 0; x < pages.length; x++){
            let navButtonInstance = document.createElement("div");
            navButtonInstance.classList.add("navBTN");

            navButtonInstance.addEventListener("click", ()=>{
                ReuestPageTransition(x);
            }, false);

            navOb.appendChild(navButtonInstance);
            navButtons[x] = navButtonInstance;
        }
    }

    function SyncNavButtons(){
        for (let x = 0; x < navButtons.length; x++){
            navButtons[x].classList.remove("active");
        }
        navButtons[currentPage].classList.add("active");
    }
})();