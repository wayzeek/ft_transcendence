

export function predictBallcollision(ball, size_renderer) {
    let height = size_renderer.height;
    let width = size_renderer.width;
    let bally = ball.mesh.position.y + (size_renderer.height / 2);
    let ballx = ball.mesh.position.x + (size_renderer.width / 2);
    let balldirectionx = ball.direction.x;

	// if (!start)
	// 	return (height/8);

    if (balldirectionx < 0)
        return(ball.mesh.position.y);

    if (balldirectionx == 0)
        balldirectionx = 0.01;

    // Estimate the time required to reach the right edge of the screen
    let estimationTime = (width - ballx) / Math.abs(ball.direction.x);

    // Estimate the new position in y after ball time
    let heightCollision = (bally + ball.direction.y * estimationTime);

    // Adjust the position in y, taking into account rebounds at the top, bottom, and left
    if (heightCollision < 10)
            heightCollision = -heightCollision;
        if (heightCollision >= height - 10) 
            heightCollision = 2 * height - heightCollision;
    

    return (heightCollision - (height / 2));
}

export function predictBallcollision2(ball, size_renderer) {
    let height = size_renderer.height;
    let width = size_renderer.width;
    let bally = ball.mesh.position.y + (size_renderer.height / 2);
    let ballx = ball.mesh.position.x + (size_renderer.width / 2);
    let paddleHeight = height / 5;
    let balldirectionx = ball.direction.x;

	// if (!start)
	// 	return (height/8);

    if (balldirectionx < 0)
        return(ball.mesh.position.y);

    if (balldirectionx == 0)
        balldirectionx = 0.01;

    // Estimate the time required to reach the right edge of the screen
    let estimationTime = (width - ballx) / Math.abs(ball.direction.x);

    // Estimate the new position in y after ball time
    let heightCollision = (bally + ball.direction.y * estimationTime);

    // Adjust the position in y, taking into account rebounds at the top, bottom, and left
    
        if (heightCollision < 10)
            heightCollision = -heightCollision;
        if (heightCollision >= height - 10) 
            heightCollision = 2 * height - heightCollision;
        
    

    // Adjust the position considering the paddle height
    if ((heightCollision - (height / 2)) > 0)
        return (heightCollision - (height / 2) - paddleHeight / 8 * 3);
    if ((heightCollision - (height / 2)) <= 0)
        return (heightCollision - (height / 2) + paddleHeight / 8 *3 );
    return (heightCollision - (height / 2));
}




