const createGame = () => {

    const background = createGameBackground();

    const createLevel = (levelData: LevelData, resources: Resources, onLevelFinish: () => void) => {

        const [canvas, context] = createCanvas(screenWidth(), screenHeight());
        const space = createSpace();

        let cancelFrameLoop: () => void;
        const inputControl = createInputControl(canvas);
        const spoolRenderSystem = createSpoolRenderSystem(resources);
        const cableRenderSystem = createCableRenderSystem();

        const shutdown = function () {
            cancelFrameLoop();
            inputControl.shutdown();
            space.shutdown();
            document.body.style.cursor = 'default';
        };
        const spoolSystem = createSpoolSystem(() => {
            shutdown();
            onLevelFinish();
        });
        const mouseDragSystem = createMouseDragSystem(inputControl);


        if (editor()) {
            const levelEditorSystem = createLevelEditorSystem(space, inputControl);
            space.registerSystem(levelEditorSystem);
        }


        space.registerSystem(spoolRenderSystem);
        space.registerSystem(spoolSystem);
        space.registerSystem(cableRenderSystem);
        space.registerSystem(mouseDragSystem);


        levelData.spools.forEach((spoolData) => {
            const spoolEntity: SpoolNodeEntity = {
                pos: {x: (spoolData[0] * screenWidth()) / editorWidth, y: (spoolData[1] * screenHeight()) / editorHeight},
                spool: {size: spoolData[2], type: NodeType.spool},
                render: {type: NodeType.spool},
            };

            space.addEntity(spoolEntity);
        });

        levelData.blocks.forEach((block) => {
            const blockEntity: BlockNodeEntity = {
                pos: {x: (block[0] * screenWidth()) / editorWidth, y: (block[1] * screenHeight()) / editorHeight},
                block: {size: block[2]},
                render: {type: NodeType.block}
            };
            space.addEntity(blockEntity);
        });

        levelData.isolators.forEach((isolator) => {
            const blockEntity: SpoolNodeEntity = {
                pos: {x: (isolator[0] * screenWidth()) / editorWidth, y: (isolator[1] * screenHeight()) / editorHeight},
                spool: {size: isolator[2], type: NodeType.isolator},
                render: {type: NodeType.isolator}
            };
            space.addEntity(blockEntity);
        });

        const start: StartNodeEntity = {
            pos: {x: (levelData.start[0] * screenWidth()) / editorWidth, y: (levelData.start[1] * screenHeight()) / editorHeight},
            spool: {size: 0, type: NodeType.start},
            render: {type: NodeType.start}
        };

        const end: EndNodeEntity = {
            pos: {x: (levelData.end[0] * screenWidth()) / editorWidth, y: (levelData.end[1] * screenHeight()) / editorHeight},
            spool: {size: 0, type: NodeType.end},
            render: {type: NodeType.end},
            mouseDrag: {size: 30}
        };

        const cable: CableEntity = {
            cable: {attachments: [{entity: start as SpoolEntity, side: Side.left}, {entity: end as SpoolEntity, side: Side.left}]}
        };

        const finish: FinishEntity = {
            finish: {},
            render: {type: NodeType.finish},
            pos: {x: (levelData.finish[0] * screenWidth()) / editorWidth, y: (levelData.finish[1] * screenHeight()) / editorHeight}
        };

        //TODO: render layers
        space.addEntity(start);
        space.addEntity(finish);
        space.addEntity(end);
        space.addEntity(cable);

        const update = (time: number) => {
            mouseDragSystem.update(time);
            spoolSystem.update(time);
            // levelEditorSystem.update(time);
        };

        const render = (time: number) => {
            context.drawImage(background, 0,0);

            cableRenderSystem.render(context, time);
            spoolRenderSystem.render(context, time);
        };

        cancelFrameLoop = startFrameLoop(time => {
            update(time);
            render(time);
        });
        return {
            canvas,
            shutdown
        };
    };

    return {
        createLevel
    };
};



