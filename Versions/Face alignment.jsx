///////////////////////////////////////////////////////////////////////////////
// Face alignment v 0.1
// jazz-y@ya.ru
///////////////////////////////////////////////////////////////////////////////
/*
<javascriptresource>
<category>jazzy</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

const faceMode = 1 // 0 - глаза, 1 глаза-губы, 2 - макушка-подбородок, 3 - глаза-подбородок
const moveMode = 1 // 0 - совмещение центров слоев выключено, 1 - совмещение центров слоев включено, 2 - совмещение только по горизонтали, 3 - совмещение только по вертикали
const transformMode = 1 // 0 - масштабирование выключено, 1 - масштабирование включено
const debugMode = 1

#target photoshop

var AM = new ActionManager
var sel = getSelectedLayersIds()

if (sel.length > 1) {
    app.doForcedProgress("detect faces...", "getFaceBounds(sel)")
    if (sel[0] instanceof Object) {
        app.doForcedProgress("align layers...", "transformLayers(sel, sel.shift())")
    }
}

function getSelectedLayersIds() {
    if (!AM.getApplicationProperty("numberOfDocuments")) return []

    var sel = AM.getActiveDocumentProperty("targetLayers"),
        len = sel instanceof Object ? sel.count : 0,
        offcet = AM.getActiveDocumentProperty("hasBackgroundLayer") ? 0 : 1,
        output = []

    for (var i = 0; i < len; i++) {
        var id = AM.getLayerPropertyByIndex("layerID", sel.getReference(i).getIndex() + offcet)
        kind = AM.getLayerPropertyById("layerKind", id)

        if (i == 0 && AM.getLayerPropertyById("background", id)) { output.push(id) } else {
            if (kind == 1 || kind == 5) {
                if (!AM.isPixlelsLocked(AM.getLayerPropertyById("layerLocking", id))) output.push(id)
            }
        }
    }
    return output
}

function getFaceBounds(selectedLayers) {
    app.activeDocument.suspendHistory("Get face bounds", "function blankState () {return}")
    var len = selectedLayers.length
    for (var i = 0; i < len; i++) {
        app.updateProgress(i + 1, len)
        AM.selectLayerById(selectedLayers[i])
        var layerBoundsDesc = AM.getLayerPropertyById("bounds", selectedLayers[i])
        if (layerBoundsDesc != null) {
            AM.convertActiveLayerToSmartObject()
            AM.editSmartObject()
            AM.flatten()
            AM.convertToRGB()
            var levelsParams = AM.liquify(faceMode)
            AM.fade("difference")
            AM.levels(levelsParams)
            AM.makeSelectionFromChannel("red")
            var selectionBoundsDesc = AM.getActiveDocumentProperty("selection")
            if (selectionBoundsDesc != null) {
                selectedLayers[i] = new AM.measure(layerBoundsDesc, selectionBoundsDesc, selectedLayers[i])
            }
            AM.closeDocument()
            AM.selectPreviousHistoryState()
        }
    }
}

function transformLayers(selectedLayers, baseLayer) {
    var len = selectedLayers.length
    for (var i = 0; i < len; i++) {
        app.updateProgress(i + 1, len)
        if (selectedLayers[i] instanceof Object) {
            var dH = baseLayer.X - selectedLayers[i].X,
                dV = baseLayer.Y - selectedLayers[i].Y,
                scaleH = 100 / (selectedLayers[i].width / baseLayer.width),
                scaleV = 100 / (selectedLayers[i].height / baseLayer.height)

            switch (faceMode) {
                case 0: scale = scaleH; break;
                case 1: case 2: scale = (scaleH + scaleV) / 2; break;
                case 3: scale = scaleV; break;
            }

            switch (moveMode) {
                case 2: dV = 0; break;
                case 3: dH = 0; break;
            }

            var scale = transformMode == 0 ? 100 : scale

            AM.selectLayerById(selectedLayers[i].id)

            AM.draw(selectedLayers[i].top, selectedLayers[i].left, selectedLayers[i].bottom, selectedLayers[i].right, "fff600")
            AM.draw(selectedLayers[i].Y - 10, selectedLayers[i].X - 10, selectedLayers[i].Y + 10, selectedLayers[i].X + 10, "ff0000")

            if (transformMode) AM.transform(scale, selectedLayers[i].X, selectedLayers[i].Y)
            if (moveMode) AM.move(dH, dV)
        }
    }
}

function ActionManager() {
    var gAdjustment = s2t("adjustment"),
        gApplication = s2t("application"),
        gBicubic = s2t("bicubic"),
        gBlendMode = s2t("blendMode"),
        gBottom = s2t("bottom"),
        gChannel = s2t("channel"),
        gClose = s2t("close"),
        gComposite = s2t("composite"),
        gConvertMode = s2t("convertMode"),
        gDocument = s2t("document"),
        gFaceMeshData = s2t("faceMeshData"),
        gFade = s2t("fade"),
        gFlatten = s2t("flattenImage"),
        gFreeTransformCenterState = s2t("freeTransformCenterState"),
        gGamma = s2t("gamma"),
        gHeight = s2t("height"),
        gHistoryState = s2t("historyState"),
        gHorizontal = s2t("horizontal"),
        gInput = s2t("input"),
        gInterfaceIconFrameDimmed = s2t("interfaceIconFrameDimmed"),
        gInterpolationType = s2t("interpolationType"),
        gLayer = s2t("layer"),
        gLeft = s2t("left"),
        gLevels = s2t("levels"),
        gLevelsAdjustment = s2t("levelsAdjustment"),
        gLiquify = charIDToTypeID("LqFy"),
        gMakeVisible = s2t("makeVisible"),
        gMode = s2t("mode"),
        gMove = s2t("move"),
        gNewPlacedLayer = s2t("newPlacedLayer"),
        gNo = s2t("no"),
        gNull = s2t("null"),
        gOffset = s2t("offset"),
        gOrdinal = s2t("ordinal"),
        gPercentUnit = s2t("percentUnit"),
        gPixelsUnit = s2t("pixelsUnit"),
        gPlacedLayerEditContents = s2t("placedLayerEditContents"),
        gPresetKind = s2t("presetKind"),
        gPresetKindCustom = s2t("presetKindCustom"),
        gPresetKindType = s2t("presetKindType"),
        gPrevious = s2t("previous"),
        gProperty = s2t("property"),
        gQuadCenterState = s2t("quadCenterState"),
        gRGBColorMode = s2t("RGBColorMode"),
        gRight = s2t("right"),
        gSave = s2t("saving"),
        gSelect = s2t("select"),
        gSelection = s2t("selection"),
        gSet = s2t("set"),
        gTargetEnum = s2t("targetEnum"),
        gTo = s2t("to"),
        gTop = s2t("top"),
        gTransform = s2t("transform"),
        gVertical = s2t("vertical"),
        gWidth = s2t("width"),
        gYes = s2t("yes"),
        gYesNo = s2t("yesNo")

    this.getApplicationProperty = function (property) {
        property = s2t(property)
        var ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putEnumerated(gApplication, gOrdinal, gTargetEnum)
        return getDescValue(executeActionGet(ref), property)
    }

    this.getActiveDocumentProperty = function (property) {
        property = s2t(property)
        var ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putEnumerated(gDocument, gOrdinal, gTargetEnum)
        return getDescValue(executeActionGet(ref), property)
    }

    this.getLayerPropertyById = function (property, id) {
        property = s2t(property)
        ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putIdentifier(gLayer, id)
        return getDescValue(executeActionGet(ref), property)
    }

    this.getLayerPropertyByIndex = function (property, idx) {
        property = s2t(property)
        ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putIndex(gLayer, idx)
        return getDescValue(executeActionGet(ref), property)
    }

    this.selectLayerById = function (id) {
        var ref = new ActionReference();
        ref.putIdentifier(gLayer, id)
        var desc = new ActionDescriptor()
        desc.putReference(gNull, ref)
        desc.putBoolean(gMakeVisible, true)
        executeAction(gSelect, desc, DialogModes.NO)
    }

    this.isPixlelsLocked = function (desc) {
        // 1 - pixels, 2 - position. 4 - allLocked
        if (desc.getBoolean(desc.getKey(1)) || desc.getBoolean(desc.getKey(2)) || desc.getBoolean(desc.getKey(4))) return true
        return false
    }

    this.flatten = function () {
        executeAction(gFlatten, undefined, DialogModes.NO);
    }

    this.convertActiveLayerToSmartObject = function () {
        executeAction(gNewPlacedLayer, undefined, DialogModes.NO)
    }

    this.editSmartObject = function () {
        executeAction(gPlacedLayerEditContents, undefined, DialogModes.NO)
    }

    this.liquify = function (mode) {
        var params,
            levels = []
        switch (mode) {
            case 0:
                params = String.fromCharCode(0, 0, 0, 16, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 77, 101, 115, 104, 0, 0, 0, 3, 0, 0, 0, 21, 102, 97, 99, 101, 68, 101, 115, 99, 114, 105, 112, 116, 111, 114, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 15, 102, 97, 99, 101, 77, 101, 115, 104, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 12, 102, 97, 99, 101, 73, 110, 102, 111, 76, 105, 115, 116, 86, 108, 76, 115, 0, 0, 0, 1, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 73, 110, 102, 111, 0, 0, 0, 3, 0, 0, 0, 10, 102, 97, 99, 101, 67, 101, 110, 116, 101, 114, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 110, 117, 108, 108, 0, 0, 0, 2, 0, 0, 0, 0, 88, 32, 32, 32, 100, 111, 117, 98, 63, 222, 73, 253, 128, 0, 0, 0, 0, 0, 0, 0, 89, 32, 32, 32, 100, 111, 117, 98, 63, 212, 77, 77, 192, 0, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 0, 0, 0, 3, 0, 0, 0, 9, 101, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 201, 153, 153, 160, 0, 0, 0, 0, 0, 0, 13, 108, 101, 102, 116, 69, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 201, 153, 153, 160, 0, 0, 0, 0, 0, 0, 14, 114, 105, 103, 104, 116, 69, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 201, 153, 153, 160, 0, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 0, 0, 0, 0)
                levels = [0, 0.3, 15]
                break;
            case 1:
                params = String.fromCharCode(0, 0, 0, 16, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 77, 101, 115, 104, 0, 0, 0, 3, 0, 0, 0, 21, 102, 97, 99, 101, 68, 101, 115, 99, 114, 105, 112, 116, 111, 114, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 15, 102, 97, 99, 101, 77, 101, 115, 104, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 12, 102, 97, 99, 101, 73, 110, 102, 111, 76, 105, 115, 116, 86, 108, 76, 115, 0, 0, 0, 1, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 73, 110, 102, 111, 0, 0, 0, 3, 0, 0, 0, 10, 102, 97, 99, 101, 67, 101, 110, 116, 101, 114, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 110, 117, 108, 108, 0, 0, 0, 2, 0, 0, 0, 0, 88, 32, 32, 32, 100, 111, 117, 98, 63, 222, 89, 128, 0, 0, 0, 0, 0, 0, 0, 0, 89, 32, 32, 32, 100, 111, 117, 98, 63, 212, 67, 45, 192, 0, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 0, 0, 0, 4, 0, 0, 0, 9, 101, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 185, 153, 153, 160, 0, 0, 0, 0, 0, 0, 13, 108, 101, 102, 116, 69, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 185, 153, 153, 160, 0, 0, 0, 0, 0, 0, 14, 114, 105, 103, 104, 116, 69, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 185, 153, 153, 160, 0, 0, 0, 0, 0, 0, 8, 117, 112, 112, 101, 114, 76, 105, 112, 100, 111, 117, 98, 191, 239, 92, 41, 0, 0, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 0, 0, 0, 0)
                levels = [0, 0.5, 8]
                break;
            case 2:
                params = String.fromCharCode(0, 0, 0, 16, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 77, 101, 115, 104, 0, 0, 0, 3, 0, 0, 0, 21, 102, 97, 99, 101, 68, 101, 115, 99, 114, 105, 112, 116, 111, 114, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 15, 102, 97, 99, 101, 77, 101, 115, 104, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 12, 102, 97, 99, 101, 73, 110, 102, 111, 76, 105, 115, 116, 86, 108, 76, 115, 0, 0, 0, 1, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 73, 110, 102, 111, 0, 0, 0, 3, 0, 0, 0, 10, 102, 97, 99, 101, 67, 101, 110, 116, 101, 114, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 110, 117, 108, 108, 0, 0, 0, 2, 0, 0, 0, 0, 88, 32, 32, 32, 100, 111, 117, 98, 63, 224, 31, 71, 133, 120, 87, 133, 0, 0, 0, 0, 89, 32, 32, 32, 100, 111, 117, 98, 63, 207, 54, 172, 125, 114, 129, 211, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 0, 0, 0, 2, 0, 0, 0, 8, 108, 111, 119, 101, 114, 76, 105, 112, 100, 111, 117, 98, 191, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 102, 111, 114, 101, 104, 101, 97, 100, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 191, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 0, 0, 0, 0)
                levels = [0, 0.7, 5]
                break;
            case 3:
                params = String.fromCharCode(0, 0, 0, 16, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 77, 101, 115, 104, 0, 0, 0, 3, 0, 0, 0, 21, 102, 97, 99, 101, 68, 101, 115, 99, 114, 105, 112, 116, 111, 114, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 15, 102, 97, 99, 101, 77, 101, 115, 104, 86, 101, 114, 115, 105, 111, 110, 108, 111, 110, 103, 0, 0, 0, 2, 0, 0, 0, 12, 102, 97, 99, 101, 73, 110, 102, 111, 76, 105, 115, 116, 86, 108, 76, 115, 0, 0, 0, 1, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 102, 97, 99, 101, 73, 110, 102, 111, 0, 0, 0, 3, 0, 0, 0, 10, 102, 97, 99, 101, 67, 101, 110, 116, 101, 114, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 110, 117, 108, 108, 0, 0, 0, 2, 0, 0, 0, 0, 88, 32, 32, 32, 100, 111, 117, 98, 63, 222, 76, 215, 64, 0, 0, 0, 0, 0, 0, 0, 89, 32, 32, 32, 100, 111, 117, 98, 63, 212, 63, 154, 64, 0, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 13, 102, 101, 97, 116, 117, 114, 101, 86, 97, 108, 117, 101, 115, 0, 0, 0, 4, 0, 0, 0, 9, 101, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 63, 201, 153, 153, 160, 0, 0, 0, 0, 0, 0, 13, 108, 101, 102, 116, 69, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 63, 201, 153, 153, 160, 0, 0, 0, 0, 0, 0, 14, 114, 105, 103, 104, 116, 69, 121, 101, 72, 101, 105, 103, 104, 116, 100, 111, 117, 98, 63, 201, 153, 153, 160, 0, 0, 0, 0, 0, 0, 8, 108, 111, 119, 101, 114, 76, 105, 112, 100, 111, 117, 98, 191, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 79, 98, 106, 99, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, 102, 101, 97, 116, 117, 114, 101, 68, 105, 115, 112, 108, 97, 99, 101, 109, 101, 110, 116, 115, 0, 0, 0, 0)
                levels = [0, 0.5, 8]
                break;

        }
        var desc = new ActionDescriptor()
        desc.putData(gFaceMeshData, params)
        executeAction(gLiquify, desc, DialogModes.NO)
        return levels
    }

    this.fade = function (mode) {
        mode = s2t(mode)
        var desc = new ActionDescriptor()
        desc.putEnumerated(gMode, gBlendMode, mode)
        executeAction(gFade, desc, DialogModes.NO)
    }

    this.levels = function (paramsArray) {
        var left = paramsArray[0],
            gamma = paramsArray[1],
            right = paramsArray[2]

        var desc = new ActionDescriptor()
        var desc2 = new ActionDescriptor()
        var list = new ActionList()
        var list2 = new ActionList()
        var ref = new ActionReference()
        desc.putEnumerated(gPresetKind, gPresetKindType, gPresetKindCustom)
        ref.putEnumerated(gChannel, gChannel, gComposite)
        desc2.putReference(gChannel, ref)
        list2.putInteger(left)
        list2.putInteger(right)
        desc2.putList(gInput, list2)
        desc2.putDouble(gGamma, gamma)
        list.putObject(gLevelsAdjustment, desc2)
        desc.putList(gAdjustment, list)
        executeAction(gLevels, desc, DialogModes.NO)
    }

    this.makeSelectionFromChannel = function (channel) {
        channel = s2t(channel)
        var desc = new ActionDescriptor()
        var ref = new ActionReference()
        var ref2 = new ActionReference()

        ref.putProperty(gChannel, gSelection)
        desc.putReference(gNull, ref)
        ref2.putEnumerated(gChannel, gChannel, channel)
        desc.putReference(gTo, ref2)
        executeAction(gSet, desc, DialogModes.NO)
    }

    this.convertToRGB = function () {
        var desc = new ActionDescriptor()
        desc.putClass(gTo, gRGBColorMode)
        executeAction(gConvertMode, desc, DialogModes.NO);
    }

    this.closeDocument = function (save) {
        save = save != true ? gNo : gYes
        var desc = new ActionDescriptor()
        desc.putEnumerated(gSave, gYesNo, save)
        executeAction(gClose, desc, DialogModes.NO)
    }

    this.selectPreviousHistoryState = function () {
        var desc = new ActionDescriptor()
        var ref = new ActionReference()
        ref.putEnumerated(gHistoryState, gOrdinal, gPrevious)
        desc.putReference(gNull, ref)
        executeAction(gSelect, desc, DialogModes.NO)
    }

    this.measure = function (lrBounds, selBounds, id) {
        var top = selBounds.getDouble(gTop) + lrBounds.getDouble(gTop),
            left = selBounds.getDouble(gLeft) + lrBounds.getDouble(gLeft),
            bottom = selBounds.getDouble(gBottom) - selBounds.getDouble(gTop) + top,
            right = selBounds.getDouble(gRight) - selBounds.getDouble(gLeft) + left

        this.top = top
        this.left = left
        this.bottom = bottom
        this.right = right
        this.width = right - left
        this.height = bottom - top
        this.X = left + (right - left) / 2
        this.Y = top + (bottom - top) / 2
        this.id = id

        return
    }

    this.transform = function (scale, cH, cV) {
        var desc = new ActionDescriptor(),
            desc2 = new ActionDescriptor(),
            ref = new ActionReference()
        ref.putEnumerated(gLayer, gOrdinal, gTargetEnum)
        desc.putReference(gNull, ref)
        desc.putEnumerated(gFreeTransformCenterState, gQuadCenterState, s2t("QCSIndependent"))
        desc2.putUnitDouble(s2t("horizontal"), s2t("pixelsUnit"), cH)
        desc2.putUnitDouble(s2t("vertical"), s2t("pixelsUnit"), cV)
        desc.putObject(s2t("position"), charIDToTypeID("Pnt "), desc2)
        desc.putUnitDouble(gWidth, gPercentUnit, scale)
        desc.putUnitDouble(gHeight, gPercentUnit, scale)
        desc.putEnumerated(gInterfaceIconFrameDimmed, gInterpolationType, gBicubic)
        executeAction(gTransform, desc, DialogModes.NO)
    }

    this.move = function (dH, dV) {
        var desc = new ActionDescriptor()
        var ref = new ActionReference()
        ref.putEnumerated(gLayer, gOrdinal, gTargetEnum)
        desc.putReference(gNull, ref)
        var desc2 = new ActionDescriptor()
        desc2.putUnitDouble(gHorizontal, gPixelsUnit, dH)
        desc2.putUnitDouble(gVertical, gPixelsUnit, dV)
        desc.putObject(gTo, gOffset, desc2)
        executeAction(gMove, desc, DialogModes.NO)
    }

    this.draw = function (top, left, bottom, right, color) {
        try {
            var desc = new ActionDescriptor()
            var ref = new ActionReference()
            ref.putEnumerated(s2t('menu'), s2t('menuItem'), s2t("rasterizePlaced"))
            desc.putReference(s2t('null'), ref)
            executeAction(s2t('select'), desc, DialogModes.NO)
        } catch (e) { }

        var desc = new ActionDescriptor()
        var desc2 = new ActionDescriptor()
        var ref = new ActionReference()

        ref.putProperty(s2t("channel"), s2t("selection"))
        desc.putReference(s2t("null"), ref)
        desc2.putUnitDouble(s2t("top"), s2t("pixelsUnit"), top)
        desc2.putUnitDouble(s2t("left"), s2t("pixelsUnit"), left)
        desc2.putUnitDouble(s2t("bottom"), s2t("pixelsUnit"), bottom)
        desc2.putUnitDouble(s2t("right"), s2t("pixelsUnit"), right)
        desc.putObject(s2t("to"), s2t("rectangle"), desc2)
        executeAction(s2t("set"), desc, DialogModes.NO)

        var col = new SolidColor()
        col.rgb.hexValue = color
        app.activeDocument.selection.stroke(col, 10, StrokeLocation.INSIDE)
        app.activeDocument.selection.deselect()
    }

    function getDescValue(desc, property) {

        try {
            switch (desc.getType(property)) {
                case DescValueType.OBJECTTYPE:
                    return (desc.getObjectValue(property));
                    break;
                case DescValueType.LISTTYPE:
                    return desc.getList(property);
                    break;
                case DescValueType.REFERENCETYPE:
                    return desc.getReference(property);
                    break;
                case DescValueType.BOOLEANTYPE:
                    return desc.getBoolean(property);
                    break;
                case DescValueType.STRINGTYPE:
                    return desc.getString(property);
                    break;
                case DescValueType.INTEGERTYPE:
                    return desc.getInteger(property);
                    break;
                case DescValueType.LARGEINTEGERTYPE:
                    return desc.getLargeInteger(property);
                    break;
                case DescValueType.DOUBLETYPE:
                    return desc.getDouble(property);
                    break;
                case DescValueType.ALIASTYPE:
                    return desc.getPath(property);
                    break;
                case DescValueType.CLASSTYPE:
                    return desc.getClass(property);
                    break;
                case DescValueType.UNITDOUBLE:
                    return (desc.getUnitDoubleValue(property));
                    break;
                case DescValueType.ENUMERATEDTYPE:
                    return (t2s(desc.getEnumerationValue(property)));
                    break;
                case DescValueType.RAWTYPE:
                    var tempStr = desc.getData(property);
                    var rawData = new Array();
                    for (var tempi = 0; tempi < tempStr.length; tempi++) {
                        rawData[tempi] = tempStr.charCodeAt(tempi);
                    }
                    return rawData;
                    break;
                default:
                    break;
            }
        } catch (e) { return null }
    }

    function s2t(s) { return stringIDToTypeID(s) }
    function t2s(t) { return typeIDToStringID(t) }
}
