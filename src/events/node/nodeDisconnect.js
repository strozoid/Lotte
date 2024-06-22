export default class {
    execute(client, node, code, reason) {
        client.rainlink.players.forEach((player, index) => {
            if (player.node.options.name == node.options.name)
                player.destroy().catch(() => { });
        });
        client.logger.debug("NodeDisconnect", `Lavalink ${node.options.name}: Disconnected, Code: ${code}, Reason: ${reason}`);
    }
}
