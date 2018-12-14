import * as React from "react";
import {Dimensions, FlatList, ListRenderItemInfo, StyleSheet, View} from "react-native";

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

interface Props {
    data: string[];
    itemsPerRow: number;
    itemMargin?: number;
    renderItem: (item: string, itemWidth: number) => JSX.Element;
}

export class PhotoGrid extends React.Component<Props> {

    public buildRows(items: string[], itemsPerRow = 3): string[][] {
        return items.reduce((rows, item, idx) => {
            // If a full row is filled create a new row array
            if (idx % itemsPerRow === 0 && idx > 0) {
                rows.push([]);
            }
            if (rows[rows.length - 1]) {
                rows[rows.length - 1].push(item);
            }
            return rows;
        }, new Array<string[]>());
    }

    public render() {
        const rows = this.buildRows(this.props.data, this.props.itemsPerRow);

        return (
            <FlatList
                {...this.props}
                data={rows}
                renderItem={this.renderRow}
                style={{flex: 1}}
            />
        );
    }

    private renderRow = (lrii: ListRenderItemInfo<string[]>) => {
        const items = lrii.item;
        // Calculate the width of a single item based on the device width
        // and the desired margins between individual items
        const deviceWidth = Dimensions.get("window").width;
        const itemsPerRow = this.props.itemsPerRow;
        const margin = this.props.itemMargin || 1;

        const totalMargin = margin * (itemsPerRow - 1);
        const itemWidth = Math.floor((deviceWidth - totalMargin) / itemsPerRow);
        const adjustedMargin = (deviceWidth - (itemsPerRow * itemWidth)) / (itemsPerRow - 1);

        return (
            <View style={[styles.row, {marginBottom: adjustedMargin}]}>
                {items.map((item) => this.props.renderItem(item, itemWidth))}
            </View>
        );
    }
}
