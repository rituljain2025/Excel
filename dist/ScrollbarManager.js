/**
 * Manages the scrollbars in the grid
 */
export class ScrollbarManager {
    /**
     * Initializes a new ScrollbarManager instance
     * @param {HTMLElement} container The container element for the scrollbars
     * @param {Function} onScroll The callback function to be called when the scroll position changes
     */
    constructor(container, onScroll) {
        /** @type {number} The maximum scroll position in the X direction */
        this.maxScrollX = 0;
        /** @type {number} The maximum scroll position in the Y direction */
        this.maxScrollY = 0;
        /** @type {number} The current scroll position in the X direction */
        this.currentScrollX = 0;
        /** @type {number} The current scroll position in the Y direction */
        this.currentScrollY = 0;
        /** @type {number} The width of the viewport */
        this.viewportWidth = 0;
        /** @type {number} The height of the viewport */
        this.viewportHeight = 0;
        /** @type {number} The width of the content */
        this.contentWidth = 0;
        /** @type {number} The height of the content */
        this.contentHeight = 0;
        /** @type {boolean} Whether the horizontal scrollbar is being dragged */
        this.isDraggingHorizontal = false;
        /** @type {boolean} Whether the vertical scrollbar is being dragged */
        this.isDraggingVertical = false;
        /** @type {number} The starting X position of the horizontal scrollbar */
        this.dragStartX = 0;
        /** @type {number} The starting Y position of the vertical scrollbar */
        this.dragStartY = 0;
        /** @type {number} The starting scroll position in the X direction */
        this.dragStartScrollX = 0;
        /** @type {number} The starting scroll position in the Y direction */
        this.dragStartScrollY = 0;
        this.container = container;
        this.onScrollCallback = onScroll;
        this.horizontalScrollbar = container.querySelector('.horizontal-scrollbar');
        this.verticalScrollbar = container.querySelector('.vertical-scrollbar');
        this.horizontalThumb = container.querySelector('.horizontal-thumb');
        this.verticalThumb = container.querySelector('.vertical-thumb');
        this.setupEventListeners();
    }
    /**
     * Sets up event listeners for the scrollbars
     */
    setupEventListeners() {
        // Horizontal scrollbar events
        this.horizontalThumb.addEventListener('mousedown', this.handleHorizontalMouseDown.bind(this));
        this.horizontalScrollbar.addEventListener('click', this.handleHorizontalTrackClick.bind(this));
        // Vertical scrollbar events
        this.verticalThumb.addEventListener('mousedown', this.handleVerticalMouseDown.bind(this));
        this.verticalScrollbar.addEventListener('click', this.handleVerticalTrackClick.bind(this));
        // Global mouse events for dragging
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        // Prevent text selection during drag
        this.horizontalThumb.addEventListener('selectstart', (e) => e.preventDefault());
        this.verticalThumb.addEventListener('selectstart', (e) => e.preventDefault());
    }
    /**
     * Handles the mouse down event for the horizontal scrollbar
     * @param {MouseEvent} event The mouse down event
     */
    handleHorizontalMouseDown(event) {
        event.preventDefault();
        this.isDraggingHorizontal = true;
        this.dragStartX = event.clientX;
        this.dragStartScrollX = this.currentScrollX;
        document.body.style.userSelect = 'none';
    }
    /**
     * Handles the mouse down event for the vertical scrollbar
     * @param {MouseEvent} event The mouse down event
     */
    handleVerticalMouseDown(event) {
        event.preventDefault();
        this.isDraggingVertical = true;
        this.dragStartY = event.clientY;
        this.dragStartScrollY = this.currentScrollY;
        document.body.style.userSelect = 'none';
    }
    /**
     * Handles the mouse move event for the scrollbars
     * @param {MouseEvent} event The mouse move event
     */
    handleMouseMove(event) {
        if (this.isDraggingHorizontal) {
            const deltaX = event.clientX - this.dragStartX;
            const trackWidth = this.horizontalScrollbar.clientWidth;
            const thumbWidth = this.horizontalThumb.clientWidth;
            const scrollableWidth = trackWidth - thumbWidth;
            if (scrollableWidth > 0) {
                const scrollRatio = deltaX / scrollableWidth;
                const newScrollX = Math.max(0, Math.min(this.maxScrollX, this.dragStartScrollX + (scrollRatio * this.maxScrollX)));
                this.setScrollX(newScrollX);
            }
        }
        if (this.isDraggingVertical) {
            const deltaY = event.clientY - this.dragStartY;
            const trackHeight = this.verticalScrollbar.clientHeight;
            const thumbHeight = this.verticalThumb.clientHeight;
            const scrollableHeight = trackHeight - thumbHeight;
            if (scrollableHeight > 0) {
                const scrollRatio = deltaY / scrollableHeight;
                const newScrollY = Math.max(0, Math.min(this.maxScrollY, this.dragStartScrollY + (scrollRatio * this.maxScrollY)));
                this.setScrollY(newScrollY);
            }
        }
    }
    /**
     * Handles the mouse up event for the scrollbars
     */
    handleMouseUp() {
        this.isDraggingHorizontal = false;
        this.isDraggingVertical = false;
        document.body.style.userSelect = '';
    }
    /**
     * Handles the click event for the horizontal scrollbar
     * @param {MouseEvent} event The click event
     */
    handleHorizontalTrackClick(event) {
        if (event.target === this.horizontalThumb)
            return;
        const rect = this.horizontalScrollbar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const thumbWidth = this.horizontalThumb.clientWidth;
        const trackWidth = this.horizontalScrollbar.clientWidth;
        const scrollRatio = (clickX - thumbWidth / 2) / (trackWidth - thumbWidth);
        const newScrollX = Math.max(0, Math.min(this.maxScrollX, scrollRatio * this.maxScrollX));
        this.setScrollX(newScrollX);
    }
    /**
     * Handles the click event for the vertical scrollbar
     * @param {MouseEvent} event The click event
     */
    handleVerticalTrackClick(event) {
        if (event.target === this.verticalThumb)
            return;
        const rect = this.verticalScrollbar.getBoundingClientRect();
        const clickY = event.clientY - rect.top;
        const thumbHeight = this.verticalThumb.clientHeight;
        const trackHeight = this.verticalScrollbar.clientHeight;
        const scrollRatio = (clickY - thumbHeight / 2) / (trackHeight - thumbHeight);
        const newScrollY = Math.max(0, Math.min(this.maxScrollY, scrollRatio * this.maxScrollY));
        this.setScrollY(newScrollY);
    }
    /**
     * Updates the scrollbars based on the viewport and content dimensions
     * @param {number} viewportWidth The width of the viewport
     * @param {number} viewportHeight The height of the viewport
     * @param {number} contentWidth The width of the content
     * @param {number} contentHeight The height of the content
     */
    updateScrollbars(viewportWidth, viewportHeight, contentWidth, contentHeight) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
        this.maxScrollX = Math.max(0, contentWidth - viewportWidth);
        this.maxScrollY = Math.max(0, contentHeight - viewportHeight);
        this.updateHorizontalScrollbar();
        this.updateVerticalScrollbar();
    }
    /**
     * Updates the horizontal scrollbar based on the viewport and content dimensions
     */
    updateHorizontalScrollbar() {
        const needsScrollbar = this.maxScrollX > 0;
        this.horizontalScrollbar.style.display = needsScrollbar ? 'block' : 'none';
        if (needsScrollbar) {
            const trackWidth = this.horizontalScrollbar.clientWidth;
            const thumbWidth = Math.max(20, (this.viewportWidth / this.contentWidth) * trackWidth);
            const scrollableWidth = trackWidth - thumbWidth;
            this.horizontalThumb.style.width = thumbWidth + 'px';
            if (this.maxScrollX > 0) {
                const thumbPosition = (this.currentScrollX / this.maxScrollX) * scrollableWidth;
                this.horizontalThumb.style.left = thumbPosition + 'px';
            }
            else {
                this.horizontalThumb.style.left = '0px';
            }
        }
    }
    /**
     * Updates the vertical scrollbar based on the viewport and content dimensions
     */
    updateVerticalScrollbar() {
        const needsScrollbar = this.maxScrollY > 0;
        this.verticalScrollbar.style.display = needsScrollbar ? 'block' : 'none';
        if (needsScrollbar) {
            const trackHeight = this.verticalScrollbar.clientHeight;
            const thumbHeight = Math.max(20, (this.viewportHeight / this.contentHeight) * trackHeight);
            const scrollableHeight = trackHeight - thumbHeight;
            this.verticalThumb.style.height = thumbHeight + 'px';
            if (this.maxScrollY > 0) {
                const thumbPosition = (this.currentScrollY / this.maxScrollY) * scrollableHeight;
                this.verticalThumb.style.top = thumbPosition + 'px';
            }
            else {
                this.verticalThumb.style.top = '0px';
            }
        }
    }
    /**
     * Sets the scroll position in the X direction
     * @param {number} scrollX The new scroll position in the X direction
     */
    setScrollX(scrollX) {
        this.currentScrollX = Math.max(0, Math.min(this.maxScrollX, scrollX));
        this.updateHorizontalScrollbar();
        this.onScrollCallback(this.currentScrollX, this.currentScrollY);
    }
    /**
     * Sets the scroll position in the Y direction
     * @param {number} scrollY The new scroll position in the Y direction
     */
    setScrollY(scrollY) {
        this.currentScrollY = Math.max(0, Math.min(this.maxScrollY, scrollY));
        this.updateVerticalScrollbar();
        this.onScrollCallback(this.currentScrollX, this.currentScrollY);
    }
    /**
     * Sets the scroll position in both directions
     * @param {number} scrollX The new scroll position in the X direction
     * @param {number} scrollY The new scroll position in the Y direction
     */
    setScroll(scrollX, scrollY) {
        this.currentScrollX = Math.max(0, Math.min(this.maxScrollX, scrollX));
        this.currentScrollY = Math.max(0, Math.min(this.maxScrollY, scrollY));
        this.updateHorizontalScrollbar();
        this.updateVerticalScrollbar();
        this.onScrollCallback(this.currentScrollX, this.currentScrollY);
    }
    /**
     * Gets the current scroll position
     * @returns {Object} An object containing the current scroll position in the X and Y directions
     */
    getScrollPosition() {
        return { x: this.currentScrollX, y: this.currentScrollY };
    }
    /**
     * Scrolls the content by a given amount
     * @param {number} deltaX The amount to scroll in the X direction
     * @param {number} deltaY The amount to scroll in the Y direction
     */
    scrollBy(deltaX, deltaY) {
        this.setScroll(this.currentScrollX + deltaX, this.currentScrollY + deltaY);
    }
}
