import {
  RenderingEngine,
  Types,
  Enums,
  getRenderingEngine,
} from '@cornerstonejs/core';
import {
  initDemo,
  createImageIdsAndCacheMetaData,
  setTitleAndDescription,
  addToggleButtonToToolbar,
} from '../../../../utils/demo/helpers';
import * as cornerstoneTools from '@cornerstonejs/tools';

// This is for debugging purposes
console.warn(
  'Click on index.ts to open source code for this example --------->'
);

const {
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  ToolGroupManager,
  Enums: csToolsEnums,
  synchronizers,
  SynchronizerManager,
} = cornerstoneTools;

const { createCameraPositionSynchronizer, createVOISynchronizer } =
  synchronizers;

const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;

// ======== Set up page ======== //
setTitleAndDescription(
  'Basic Stack Manipulation',
  'Manipulation tools for a stack viewport'
);

const renderingEngineId = 'myRenderingEngine';

const size = '500px';
const content = document.getElementById('content');
const element = document.createElement('div');
const element2 = document.createElement('div');

const viewportGrid = document.createElement('div');

viewportGrid.style.display = 'flex';
viewportGrid.style.display = 'flex';
viewportGrid.style.flexDirection = 'row';

element.id = 'cornerstone-element';
element.style.width = size;
element.style.height = size;
element.id = 'cornerstone-element-2';
element2.style.width = size;
element2.style.height = size;

viewportGrid.appendChild(element);
viewportGrid.appendChild(element2);

content.appendChild(viewportGrid);

// Disable right click context menu so we can have right click tools
element.oncontextmenu = (e) => e.preventDefault();

// content.appendChild(element);

const instructions = document.createElement('p');
instructions.innerText =
  'Left Click: Window/Level\nMiddle Click: Pan\nRight Click: Zoom\n Mouse Wheel: Stack Scroll';

content.append(instructions);

const viewportIds = [
  'CT_SAGITTAL_STACK_1',
  'CT_SAGITTAL_STACK_2',
  //'CT_SAGITTAL_STACK_3',
];

const cameraSynchronizerId = 'CAMERA_SYNCHRONIZER_ID';

const SynchronizerButtonInfo = [
  { viewportLabel: 'A', viewportId: viewportIds[0] },
  { viewportLabel: 'B', viewportId: viewportIds[1] },
  //{ viewportLabel: 'C', viewportId: viewportIds[2] },
];

SynchronizerButtonInfo.forEach(({ viewportLabel, viewportId }) => {
  addToggleButtonToToolbar({
    title: `Camera ${viewportLabel}`,
    onClick: (toggle) => {
      const synchronizer =
        SynchronizerManager.getSynchronizer(cameraSynchronizerId);

      console.log('find:synchronizer', synchronizer);
      console.log('find:toggle', toggle);

      if (!synchronizer) {
        return;
      }

      if (toggle) {
        synchronizer.add({ renderingEngineId, viewportId });
      } else {
        synchronizer.remove({ renderingEngineId, viewportId });
      }
    },
  });
});

// ============================= //

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await initDemo();

  const toolGroupId = 'STACK_TOOL_GROUP_ID';

  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(ZoomTool);

  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // Add tools to the tool group
  toolGroup.addTool(WindowLevelTool.toolName);
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(StackScrollMouseWheelTool.toolName);

  // Set the initial state of the tools, here all tools are active and bound to
  // Different mouse inputs
  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary, // Left Click
      },
    ],
  });
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });
  // As the Stack Scroll mouse wheel is a tool using the `mouseWheelCallback`
  // hook instead of mouse buttons, it does not need to assign any mouse button.
  toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

  //createCameraPositionSynchronizer(cameraSynchronizerId);

  SynchronizerManager.createSynchronizer(
    cameraSynchronizerId,
    Enums.Events.CAMERA_MODIFIED,
    (
      synchronizerInstance,
      sourceViewport,
      targetViewport,
      cameraModifiedEvent
    ) => {
      console.log({
        //synchronizerInstance,
        sourceViewport,
        sourceViewportId: sourceViewport.viewportId,
        targetViewportId: targetViewport.viewportId,
        cameraModifiedEvent,
      });

      const { camera } = cameraModifiedEvent.detail;

      const renderingEngine = getRenderingEngine(
        targetViewport.renderingEngineId
      );
      if (!renderingEngine) {
        throw new Error(
          `No RenderingEngine for Id: ${targetViewport.renderingEngineId}`
        );
      }

      const sViewport = renderingEngine.getViewport(sourceViewport.viewportId);

      console.log('find:tViewport', sViewport);
      console.log(
        'find:sViewport.getCurrentImageIdIndex',
        sViewport.getCurrentImageIdIndex()
      );

      const tViewport = renderingEngine.getViewport(targetViewport.viewportId);

      console.log('find:tViewport', tViewport);
      console.log(
        'find:tViewport.getCurrentImageIdIndex',
        tViewport.getCurrentImageIdIndex()
      );

      tViewport.setImageIdIndex(sViewport.getCurrentImageIdIndex());

      // tViewport.setCamera(camera);
      // tViewport.render();
    }
  );

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    SeriesInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
    wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
    type: 'STACK',
  });

  const imageIds2 = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      '1.3.6.1.4.1.53684.1.1.2.4037847388.7016.1636643714.1136392',
    SeriesInstanceUID:
      '1.3.6.1.4.1.53684.1.1.3.4037847388.7016.1636643720.1136468',
    wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
    type: 'STACK',
  });

  // Instantiate a rendering engine
  const renderingEngine = new RenderingEngine(renderingEngineId);

  // Create a stack viewport
  // const viewportId = 'CT_STACK';
  // const viewportInput = {
  //   viewportId,
  //   type: ViewportType.STACK,
  //   element,
  //   defaultOptions: {
  //     background: <Types.Point3>[0.2, 0, 0.2],
  //   },
  // };

  const viewportInputArray = [
    {
      viewportId: viewportIds[0],
      type: ViewportType.STACK,
      element,
      defaultOptions: {
        background: <Types.Point3>[0.2, 0, 0.2],
      },
    },
    {
      viewportId: viewportIds[1],
      type: ViewportType.STACK,
      element: element2,
      defaultOptions: {
        background: <Types.Point3>[0.2, 0, 0.2],
      },
    },
  ];

  //renderingEngine.enableElement(viewportInput);
  renderingEngine.setViewports(viewportInputArray);

  // Set the tool group on the viewport
  toolGroup.addViewport(viewportIds[0], renderingEngineId);

  // Get the stack viewport that was created
  const viewport = <Types.IStackViewport>(
    renderingEngine.getViewport(viewportIds[0])
  );

  // Define a stack containing a single image
  //const stack = [imageIds[0], imageIds[1], imageIds[2]];
  const stack = imageIds;

  // Set the stack on the viewport
  viewport.setStack(stack);

  // Render the image
  viewport.render();

  // Set the tool group on the viewport
  toolGroup.addViewport(viewportIds[1], renderingEngineId);

  // Get the stack viewport that was created
  const viewport2 = <Types.IStackViewport>(
    renderingEngine.getViewport(viewportIds[1])
  );

  // Define a stack containing a single image
  //const stack = [imageIds[0], imageIds[1], imageIds[2]];
  const stack2 = imageIds2;

  // Set the stack on the viewport
  viewport2.setStack(stack2);

  // Render the image
  viewport2.render();

  // for (const viewportId of viewportIds) {
  //   // Set the tool group on the viewport
  //   toolGroup.addViewport(viewportId, renderingEngineId);

  //   // Get the stack viewport that was created
  //   const viewport = <Types.IStackViewport>(
  //     renderingEngine.getViewport(viewportId)
  //   );

  //   // Define a stack containing a single image
  //   //const stack = [imageIds[0], imageIds[1], imageIds[2]];
  //   const stack = imageIds;

  //   // Set the stack on the viewport
  //   viewport.setStack(stack);

  //   // Render the image
  //   viewport.render();
  // }
}

run();
